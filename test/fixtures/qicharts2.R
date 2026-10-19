# Regenerates test/fixtures/qicharts2.ts from the qicharts2 CRAN package: Rscript test/fixtures/qicharts2.R
library(qicharts2)

cases <- list()

# Every chart's limits here are linear in sigma, so sigma = (ucl - cl) / 3 recovers it exactly from
# qicharts2's output, or (cl - lcl) / 3 where a p/pp upper limit is clamped at 1. The 1-sigma limits
# then clamp at 0 and 1 as qicharts2 clamps its own. Not derivable: t (back-transformed limits), g (the
# centreline is the median, the limits use the mean) and run (no limits). mr's limits are multiples of
# the mean range (ucl.95 = ucl * 2 / 3 in qicharts2), so its 1-sigma analogue is ucl / 3 above 0.
derive_68 <- function(d, chart, multiply) {
  n <- nrow(d)
  ll68 <- rep(NA_real_, n)
  ul68 <- rep(NA_real_, n)
  if (chart %in% c("i", "xbar", "c", "u", "up", "p", "pp", "s")) {
    sigma <- (d$ucl - d$cl) / 3
    if (chart %in% c("p", "pp")) {
      clamped <- d$ucl >= multiply
      from_lower <- (d$cl - d$lcl) / 3
      from_lower[d$lcl <= 0] <- NA
      sigma[clamped] <- from_lower[clamped]
    }
    ll68 <- d$cl - sigma
    ul68 <- d$cl + sigma
    if (chart %in% c("c", "u", "up", "p", "pp", "s")) {
      ll68 <- pmax(0, ll68)
    }
    if (chart %in% c("p", "pp")) {
      ul68 <- pmin(multiply, ul68)
    }
  } else if (chart == "mr") {
    ll68 <- rep(0, n)
    ul68 <- d$ucl / 3
  }
  list(ll68 = ll68, ul68 = ul68)
}

# Every chart is symmetric in point order, so a baseline of the last k points (SPC's subset from the End)
# is qicharts2's freeze on the reversed series. Dates become reversed ranks so qic() orders them the same way.
reverse_ranks <- function(x) {
  levels <- sort(unique(x))
  length(levels) + 1 - match(x, levels)
}

# qicharts2 part/freeze count points; SPC split indexes are the 0-based last index of a segment.
# Rows whose y is missing stay in qicharts2's output (with NA y) and are dropped from the expectations,
# as SPC removes them; qicharts2 also drops rows with a missing x.
add_case <- function(name, chart_type, inputs, data, chart, multiply = 1, screened = FALSE,
                     freeze = NULL, part = NULL, from_end = FALSE) {
  options(qic.screenedmr = screened)
  if (from_end) {
    data$x <- reverse_ranks(data$x)
  }
  # qic() deparses its y argument, so columns are passed as symbols with the data frame
  args <- list(x = quote(x), y = quote(y), data = data, chart = chart, multiply = multiply,
               freeze = freeze, part = part, return.data = TRUE)
  if ("n" %in% names(data)) {
    args$n <- quote(n)
  }
  d <- do.call(qic, args)
  if (from_end) {
    d <- d[rev(seq_len(nrow(d))), ]
    stopifnot(nrow(d) == length(inputs$keys))
  } else {
    stopifnot(identical(as.character(d$x), inputs$keys[!is.na(inputs$keys)]))
  }
  d <- d[!is.na(d$y), ]
  limits68 <- derive_68(d, chart, multiply)
  cases[[length(cases) + 1]] <<- list(
    name = name,
    chart_type = chart_type,
    multiplier = multiply,
    outliers_in_limits = !screened,
    num_points_subset = freeze,
    subset_points_from = ifelse(from_end, "End", "Start"),
    split_indexes = as.list(part - 1),
    keys = inputs$keys,
    numerators = inputs$numerators,
    denominators = inputs$denominators,
    xbar_sds = inputs$xbar_sds,
    expected = list(values = d$y, target = d$cl, ll99 = d$lcl, ll95 = d$lcl.95, ll68 = limits68$ll68,
                    ul68 = limits68$ul68, ul95 = d$ucl.95, ul99 = d$ucl)
  )
}

# Every chart under each qic() option that SPC also exposes
add_matrix <- function(name, chart_type, inputs, data, chart) {
  n <- length(inputs$keys)
  half <- floor(n / 2)
  third <- floor(n / 3)
  add_case(name, chart_type, inputs, data, chart)
  add_case(paste(name, "x1000"), chart_type, inputs, data, chart, multiply = 1000)
  add_case(paste(name, "freeze", half), chart_type, inputs, data, chart, freeze = half)
  add_case(paste(name, "last", half), chart_type, inputs, data, chart, freeze = half, from_end = TRUE)
  add_case(paste(name, "part", half), chart_type, inputs, data, chart, part = half)
  add_case(paste(name, "parts", third, 2 * third), chart_type, inputs, data, chart, part = c(third, 2 * third))
  add_case(paste(name, "screened"), chart_type, inputs, data, chart, screened = TRUE)
}

# cdi: counts and risk days by month
cdi_in <- list(keys = as.character(cdi$month), numerators = cdi$n)
cdi_u_in <- c(cdi_in, list(denominators = cdi$days))
cdi_df <- data.frame(x = cdi$month, y = cdi$n)
cdi_u_df <- data.frame(x = cdi$month, y = cdi$n, n = cdi$days)
add_matrix("cdi run", "run", cdi_in, cdi_df, "run")
add_matrix("cdi c", "c", cdi_in, cdi_df, "c")
add_matrix("cdi u", "u", cdi_u_in, cdi_u_df, "u")

# cdi: the last year's low counts put the lower c limits below zero
cdi_low <- tail(cdi, 12)
add_case("cdi c floor", "c", list(keys = as.character(cdi_low$month), numerators = cdi_low$n),
         data.frame(x = cdi_low$month, y = cdi_low$n), "c")

# cdi: months with a missing count, a missing count and days, and a missing month
cdi_na <- cdi
cdi_na$n[c(3, 20)] <- NA
cdi_na$days[20] <- NA
cdi_na_in <- list(keys = as.character(cdi_na$month), numerators = cdi_na$n)
cdi_na_df <- data.frame(x = cdi_na$month, y = cdi_na$n)
add_case("cdi run missing", "run", cdi_na_in, cdi_na_df, "run")
add_case("cdi c missing", "c", cdi_na_in, cdi_na_df, "c")
add_case("cdi c missing x1000", "c", cdi_na_in, cdi_na_df, "c", multiply = 1000)
cdi_na_u <- cdi_na
cdi_na_u$n[20] <- NA
cdi_na_u$days[c(3, 20)] <- NA
add_case("cdi u missing", "u", list(keys = as.character(cdi_na_u$month), numerators = cdi_na_u$n, denominators = cdi_na_u$days),
         data.frame(x = cdi_na_u$month, y = cdi_na_u$n, n = cdi_na_u$days), "u")
cdi_nx <- cdi
cdi_nx_keys <- as.character(cdi_nx$month)
cdi_nx_keys[7] <- NA
add_case("cdi c missing month", "c", list(keys = cdi_nx_keys, numerators = cdi_nx$n),
         data.frame(x = replace(cdi_nx$month, 7, NA), y = cdi_nx$n), "c")

# nhs_accidents: weekly proportions seen within 4 hours
nhs_in <- list(keys = as.character(nhs_accidents$i), numerators = nhs_accidents$r, denominators = nhs_accidents$n)
nhs_df <- data.frame(x = nhs_accidents$i, y = nhs_accidents$r, n = nhs_accidents$n)
add_matrix("nhs p", "p", nhs_in, nhs_df, "p")
add_matrix("nhs pp", "pp", nhs_in, nhs_df, "pp")
add_matrix("nhs i ratio", "i", nhs_in, nhs_df, "i")

# hospital_infections: all hospitals and infections summed by month
hai <- aggregate(cbind(n, days) ~ month, data = hospital_infections, FUN = sum)
hai_in <- list(keys = as.character(hai$month), numerators = hai$n, denominators = hai$days)
hai_df <- data.frame(x = hai$month, y = hai$n, n = hai$days)
add_matrix("hai up", "up", hai_in, hai_df, "up")

# hospital_infections: one hospital's bacteraemias, few enough for the 3-sigma lower limits to floor at zero
bfh <- hospital_infections[hospital_infections$hospital == "BFH" & hospital_infections$infection == "BAC", ]
bfh_in <- list(keys = as.character(bfh$month), numerators = bfh$n, denominators = bfh$days)
bfh_df <- data.frame(x = bfh$month, y = bfh$n, n = bfh$days)
add_case("bfh bac up floor", "up", bfh_in, bfh_df, "up")
add_case("bfh bac u floor", "u", bfh_in, bfh_df, "u")

# cabg: individual ages of the last 100 patients
age <- tail(cabg$age, 100)
age_in <- list(keys = as.character(seq_along(age)), numerators = age)
age_df <- data.frame(x = seq_along(age), y = age)
add_matrix("cabg age i", "i", age_in, age_df, "i")
add_matrix("cabg age mr", "mr", age_in, age_df, "mr")

# cabg: age by month for xbar/s with varying subgroup sizes
cabg$month <- as.Date(cut(cabg$date, "month"))
months <- split(cabg, cabg$month)
cabg_month <- data.frame(
  month = as.Date(names(months)),
  mean = vapply(months, function(g) mean(g$age), 1),
  sd = vapply(months, function(g) sd(g$age), 1),
  n = vapply(months, nrow, 1L)
)
month_keys <- as.character(cabg_month$month)
cabg_df <- data.frame(x = cabg$month, y = cabg$age)
add_matrix("cabg xbar", "xbar",
           list(keys = month_keys, numerators = cabg_month$mean, denominators = cabg_month$n, xbar_sds = cabg_month$sd),
           cabg_df, "xbar")
add_matrix("cabg s", "s", list(keys = month_keys, numerators = cabg_month$sd, denominators = cabg_month$n), cabg_df, "s")

# cabg: deaths and survivals by month; small months clamp the proportions' limits at 0 and 1
deaths <- vapply(months, function(g) sum(g$death), 1)
patients <- vapply(months, nrow, 1)
add_matrix("cabg deaths p", "p", list(keys = month_keys, numerators = deaths, denominators = patients),
           data.frame(x = cabg_month$month, y = deaths, n = patients), "p")
add_case("cabg deaths pp", "pp", list(keys = month_keys, numerators = deaths, denominators = patients),
         data.frame(x = cabg_month$month, y = deaths, n = patients), "pp")
add_case("cabg survivals p ceiling", "p", list(keys = month_keys, numerators = patients - deaths, denominators = patients),
         data.frame(x = cabg_month$month, y = patients - deaths, n = patients), "p")
add_case("cabg survivals pp ceiling", "pp", list(keys = month_keys, numerators = patients - deaths, denominators = patients),
         data.frame(x = cabg_month$month, y = patients - deaths, n = patients), "pp")
deaths_na <- replace(deaths, c(5, 30), NA)
patients_na <- replace(patients, c(5, 30), NA)
add_case("cabg deaths p missing", "p", list(keys = month_keys, numerators = deaths_na, denominators = patients_na),
         data.frame(x = cabg_month$month, y = deaths_na, n = patients_na), "p")

# cabg: constant subgroup size of 10 (mean-SD rather than pooled-SD estimate)
eq <- head(cabg, 200)
eq$grp <- rep(seq_len(20), each = 10)
groups <- split(eq$age, eq$grp)
eq_mean <- vapply(groups, mean, 1)
eq_sd <- vapply(groups, sd, 1)
eq_keys <- as.character(seq_len(20))
eq_df <- data.frame(x = eq$grp, y = eq$age)
add_matrix("cabg xbar constant n", "xbar",
           list(keys = eq_keys, numerators = eq_mean, denominators = rep(10, 20), xbar_sds = eq_sd), eq_df, "xbar")
add_matrix("cabg s constant n", "s", list(keys = eq_keys, numerators = eq_sd, denominators = rep(10, 20)), eq_df, "s")

# cabg: subgroups of 4, small enough for the s chart's lower limits to floor at zero
sm <- head(cabg, 80)
sm$grp <- rep(seq_len(20), each = 4)
sm_sd <- vapply(split(sm$age, sm$grp), sd, 1)
add_case("cabg s small n floor", "s", list(keys = eq_keys, numerators = sm_sd, denominators = rep(4, 20)),
         data.frame(x = sm$grp, y = sm$age), "s")

# cabg: surgeries and days between deaths
death_rows <- which(cabg$death)
dd <- diff(death_rows)
dt <- as.numeric(diff(cabg$date[death_rows]))
dt <- dt[dt > 0]
add_matrix("cabg g", "g", list(keys = as.character(seq_along(dd)), numerators = dd), data.frame(x = seq_along(dd), y = dd), "g")
add_matrix("cabg t", "t", list(keys = as.character(seq_along(dt)), numerators = dt), data.frame(x = seq_along(dt), y = dt), "t")
dd_na <- replace(dd, c(2, 40), NA)
add_case("cabg g missing", "g", list(keys = as.character(seq_along(dd_na)), numerators = dd_na),
         data.frame(x = seq_along(dd_na), y = dd_na), "g")

# cabg: the first intervals between deaths, whose spread puts the 3-sigma (not the 2-sigma) lower t limit below zero
dt_early <- head(dt, 6)
add_case("cabg t floor", "t", list(keys = as.character(seq_along(dt_early)), numerators = dt_early),
         data.frame(x = seq_along(dt_early), y = dt_early), "t")

json <- jsonlite::toJSON(cases, digits = I(17), auto_unbox = TRUE, null = "null", na = "null", pretty = TRUE)
header <- sprintf("// Generated by test/fixtures/qicharts2.R with qicharts2 %s. Do not edit.\n", packageVersion("qicharts2"))
writeLines(c(header, 'import type { Qicharts2Case } from "./qicharts2Case";', "",
             paste0("export default ", json, " satisfies Qicharts2Case[];")), "test/fixtures/qicharts2.ts")
cat(length(cases), "cases written\n")

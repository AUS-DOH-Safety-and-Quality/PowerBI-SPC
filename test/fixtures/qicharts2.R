# Regenerates test/fixtures/qicharts2.ts from the qicharts2 CRAN package: Rscript test/fixtures/qicharts2.R
library(qicharts2)

cases <- list()

# qicharts2 part/freeze count points; SPC split indexes are the 0-based last index of a segment.
add_case <- function(name, chart_type, inputs, data, chart, multiply = 1, screened = FALSE,
                     freeze = NULL, part = NULL) {
  options(qic.screenedmr = screened)
  # qic() deparses its y argument, so columns are passed as symbols with the data frame
  args <- list(x = quote(x), y = quote(y), data = data, chart = chart, multiply = multiply,
               freeze = freeze, part = part, return.data = TRUE)
  if ("n" %in% names(data)) {
    args$n <- quote(n)
  }
  d <- do.call(qic, args)
  stopifnot(identical(as.character(d$x), inputs$keys))
  if (chart_type == "mr") {
    d <- d[!is.na(d$y), ]
  }
  cases[[length(cases) + 1]] <<- list(
    name = name,
    chart_type = chart_type,
    multiplier = multiply,
    outliers_in_limits = !screened,
    num_points_subset = freeze,
    split_indexes = as.list(part - 1),
    keys = inputs$keys,
    numerators = inputs$numerators,
    denominators = inputs$denominators,
    xbar_sds = inputs$xbar_sds,
    expected = list(values = d$y, targets = d$cl, ll99 = d$lcl, ll95 = d$lcl.95, ul95 = d$ucl.95, ul99 = d$ucl)
  )
}

# Every chart under each qic() option that SPC also exposes
add_matrix <- function(name, chart_type, inputs, data, chart) {
  half <- floor(length(inputs$keys) / 2)
  add_case(name, chart_type, inputs, data, chart)
  add_case(paste(name, "x1000"), chart_type, inputs, data, chart, multiply = 1000)
  add_case(paste(name, "freeze", half), chart_type, inputs, data, chart, freeze = half)
  add_case(paste(name, "part", half), chart_type, inputs, data, chart, part = half)
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

# cabg: surgeries and days between deaths
death_rows <- which(cabg$death)
dd <- diff(death_rows)
dt <- as.numeric(diff(cabg$date[death_rows]))
dt <- dt[dt > 0]
add_matrix("cabg g", "g", list(keys = as.character(seq_along(dd)), numerators = dd), data.frame(x = seq_along(dd), y = dd), "g")
add_matrix("cabg t", "t", list(keys = as.character(seq_along(dt)), numerators = dt), data.frame(x = seq_along(dt), y = dt), "t")

json <- jsonlite::toJSON(cases, digits = I(17), auto_unbox = TRUE, null = "null", na = "null", pretty = TRUE)
header <- sprintf("// Generated by test/fixtures/qicharts2.R with qicharts2 %s. Do not edit.\n", packageVersion("qicharts2"))
writeLines(c(header, 'import type { Qicharts2Case } from "./qicharts2Case";', "",
             paste0("export default ", json, " satisfies Qicharts2Case[];")), "test/fixtures/qicharts2.ts")
cat(length(cases), "cases written\n")

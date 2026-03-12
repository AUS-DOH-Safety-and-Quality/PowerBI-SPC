#!/usr/bin/env Rscript
# =============================================================================
# Golden Dataset Generator for PowerBI-SPC
#
# Generates JSON fixture files from R's qicharts2 package for cross-validation
# with the TypeScript SPC limit calculations.
#
# Dependencies:
#   install.packages(c("qicharts2", "jsonlite"))
#
# Usage:
#   Rscript generate_golden.R [output_dir]
#
# Default output: test/fixtures/golden/<chart_type>/<scenario>.qicharts2.json
#
# Files are written with a ".qicharts2" suffix to distinguish R-generated
# reference values from the TypeScript-seeded fixtures used by the test suite.
# Compare side-by-side to identify any calculation differences.
#
# qicharts2 supports: c, i, p, u, run
# Custom R (methodology differs from qicharts2): g, mr, s, t
# Custom R (not in qicharts2): i_m, i_mm, pp, up
# Skipped: xbar (qicharts2 needs raw subgroup data)
# =============================================================================

library(qicharts2)
library(jsonlite)

# --- Configuration ---

args <- commandArgs(trailingOnly = TRUE)
# Resolve script directory: use the directory of this file, falling back to
# the known relative path from the project root when sys.frame is unavailable.
script_dir <- tryCatch(
  dirname(sys.frame(1)$ofile),
  error = function(e) "test/fixtures/golden/generators"
)
output_dir <- if (length(args) > 0) args[1] else file.path(script_dir, "..")

TODAY <- Sys.Date()
QICHARTS_VERSION <- as.character(packageVersion("qicharts2"))
R_VERSION <- R.version.string
SOURCE <- paste0("qicharts2 ", QICHARTS_VERSION, ", ", R_VERSION)

# --- Helper functions ---

#' Write a golden dataset JSON fixture
#'
#' @param chart_type String matching the TypeScript limit function export name
#' @param scenario Scenario name (used as filename without .json)
#' @param inputs List with keys, numerators, denominators, etc.
#' @param expected List with targets, values, ul99, ul95, ul68, ll68, ll95, ll99
#' @param reference Statistical reference string
#' @param precision Number of decimal places for expected values
#' @param source_note Override source attribution (for non-qicharts2 charts)
write_golden <- function(chart_type, scenario, inputs, expected, reference,
                         precision, source_note = SOURCE) {
  golden <- list(
    metadata = list(
      chart_type = chart_type,
      scenario = scenario,
      source = source_note,
      reference = reference,
      generated_date = as.character(TODAY),
      precision = precision
    ),
    inputs = inputs,
    expected = expected
  )

  out_dir <- file.path(output_dir, chart_type)
  dir.create(out_dir, recursive = TRUE, showWarnings = FALSE)
  out_path <- file.path(out_dir, paste0(scenario, ".qicharts2.json"))
  writeLines(
    toJSON(golden, auto_unbox = TRUE, digits = precision + 4, pretty = TRUE),
    out_path
  )
  cat("  Written:", out_path, "\n")
}

#' Extract limits from a qicharts2 qic() result
#' qic() returns a ggplot object; the data is in $data with columns:
#'   y (values), cl (centreline), lcl (lower 3σ), ucl (upper 3σ)
#'
#' 1σ and 2σ limits are derived: sigma_i = (ucl_i - cl_i) / 3
extract_limits <- function(qic_result, precision, clamp_fn = NULL) {
  d <- qic_result$data
  cl <- d$cl
  ucl <- d$ucl
  lcl <- d$lcl
  y <- d$y
  sigma <- (ucl - cl) / 3

  ul99 <- ucl
  ul95 <- cl + 2 * sigma
  ul68 <- cl + sigma
  ll68 <- cl - sigma
  ll95 <- cl - 2 * sigma
  ll99 <- lcl

  # Apply chart-specific clamping if provided
  if (!is.null(clamp_fn)) {
    result <- clamp_fn(list(
      ul99 = ul99, ul95 = ul95, ul68 = ul68,
      ll68 = ll68, ll95 = ll95, ll99 = ll99
    ))
    ul99 <- result$ul99; ul95 <- result$ul95; ul68 <- result$ul68
    ll68 <- result$ll68; ll95 <- result$ll95; ll99 <- result$ll99
  }

  rnd <- function(x) round(x, precision + 2)
  list(
    targets = rnd(cl),
    values = rnd(y),
    ul99 = rnd(ul99), ul95 = rnd(ul95), ul68 = rnd(ul68),
    ll68 = rnd(ll68), ll95 = rnd(ll95), ll99 = rnd(ll99)
  )
}

# Clamping: lower limits >= 0
clamp_nonneg <- function(lims) {
  lims$ll68 <- pmax(0, lims$ll68)
  lims$ll95 <- pmax(0, lims$ll95)
  lims$ll99 <- pmax(0, lims$ll99)
  lims
}

# Clamping: all limits in [0, 1]
clamp_01 <- function(lims) {
  for (nm in names(lims)) {
    lims[[nm]] <- pmin(1, pmax(0, lims[[nm]]))
  }
  lims
}

# Bias correction factor for n=2 (moving range of span 2)
d2 <- 1.128

cat("Generating golden datasets...\n\n")

# =============================================================================
# CHARTS WITH qicharts2 SUPPORT
# =============================================================================

# --- I-chart (ratio inputs) ---
i_num <- c(5,7,5,7,7,5,4,9,8,13,8,7,8,7,12,11,8)
i_den <- c(113,132,121,134,116,131,93,138,182,157,100,103,146,108,153,141,134)
i_vals <- i_num / i_den
i_keys <- c("2010-01-01","2010-02-01","2010-03-01","2010-04-01","2010-05-01",
             "2010-06-01","2010-07-01","2010-08-01","2010-09-01","2010-10-01",
             "2010-11-01","2010-12-01","2011-01-01","2011-02-01","2011-03-01",
             "2011-04-01","2011-05-01")

qic_i <- qic(i_vals, chart = "i")
write_golden("i", "basic-ratio",
  inputs = list(keys = i_keys, numerators = i_num, denominators = i_den),
  expected = extract_limits(qic_i, 4),
  reference = "Montgomery 2009, Chapter 6",
  precision = 4
)

# --- MR-chart (ratio inputs) --- CUSTOM: TS drops first point, uses D4=3.267
{
  mr_vals <- abs(diff(i_vals))      # n-1 moving ranges
  mr_cl <- mean(mr_vals)            # Average moving range
  D4 <- 3.267
  n_mr <- length(mr_vals)

  rnd_mr <- function(x) round(x, 6)
  write_golden("mr", "basic-ratio",
    inputs = list(keys = i_keys, numerators = i_num, denominators = i_den),
    expected = list(
      targets = rep(rnd_mr(mr_cl), n_mr),
      values = rnd_mr(mr_vals),
      ul99 = rep(rnd_mr(D4 * mr_cl), n_mr),
      ul95 = rep(rnd_mr((D4 / 3) * 2 * mr_cl), n_mr),
      ul68 = rep(rnd_mr((D4 / 3) * 1 * mr_cl), n_mr),
      ll68 = rep(0, n_mr),
      ll95 = rep(0, n_mr),
      ll99 = rep(0, n_mr)
    ),
    reference = "Montgomery 2009, Chapter 6 (MR chart, D4=3.267)",
    precision = 4,
    source_note = paste0("Custom R calculation (D4 method), ", R_VERSION)
  )
}

# --- C-chart (group 1: first 24 points) ---
c_num_g1 <- c(17,12,27,20,20,18,22,19,19,24,17,16,24,19,19,22,25,19,17,6,25,17,11,14)
c_keys_g1 <- c("2012-11-01","2012-12-01","2013-01-01","2013-02-01","2013-03-01",
                "2013-04-01","2013-05-01","2013-06-01","2013-07-01","2013-08-01",
                "2013-09-01","2013-10-01","2013-11-01","2013-12-01","2014-01-01",
                "2014-02-01","2014-03-01","2014-04-01","2014-05-01","2014-06-01",
                "2014-07-01","2014-08-01","2014-09-01","2014-10-01")

qic_c <- qic(c_num_g1, chart = "c")
write_golden("c", "basic-group1",
  inputs = list(keys = c_keys_g1, numerators = c_num_g1),
  expected = extract_limits(qic_c, 2, clamp_nonneg),
  reference = "Montgomery 2009, Chapter 7 (Poisson counts)",
  precision = 2
)

# --- P-chart ---
p_num <- c(14,12,15,8,16,11,12,14,16,17,5,11,13,10,14,5,12,10,11,5,10,8,11,12,11,18,18,21,14,15,18,22,17,16,20,15)
p_den <- c(52,64,70,60,67,69,67,54,79,59,49,61,41,51,56,43,57,48,69,41,40,46,59,62,57,65,75,70,76,69,64,67,84,67,69,78)
p_keys <- c("2011-07-01","2011-08-01","2011-09-01","2011-10-01","2011-11-01",
             "2011-12-01","2012-01-01","2012-02-01","2012-03-01","2012-04-01",
             "2012-05-01","2012-06-01","2012-07-01","2012-08-01","2012-09-01",
             "2012-10-01","2012-11-01","2012-12-01","2013-01-01","2013-02-01",
             "2013-03-01","2013-04-01","2013-05-01","2013-06-01","2013-07-01",
             "2013-08-01","2013-09-01","2013-10-01","2013-11-01","2013-12-01",
             "2014-01-01","2014-02-01","2014-03-01","2014-04-01","2014-05-01",
             "2014-06-01")

# qicharts2 p-chart expects x=events, n=trials
qic_p <- qic(p_num, n = p_den, chart = "p")
write_golden("p", "basic",
  inputs = list(keys = p_keys, numerators = p_num, denominators = p_den),
  expected = extract_limits(qic_p, 2, clamp_01),
  reference = "Montgomery 2009, Chapter 7 (Binomial proportions)",
  precision = 2
)

# --- G-chart --- CUSTOM: sigma = sqrt(mean*(mean+1)), centreline = median
{
  g_num <- c(23,39,15,34,1,49,98,29,27,13,45,7,10,27,24,14,20,38,44,11,10,3,113,183,3,47,18,18,33,15,2,38,27,27,1,52,23,7,26,82,5,49,5,17,24,44,26,2,27,46,55,97,22,22,20,4,60,51,7,21,66,36,25,72,15,5,3)
  g_keys <- as.character(1:67)
  n_g <- length(g_num)

  g_mean <- mean(g_num)
  g_median <- median(g_num)
  g_sigma <- sqrt(g_mean * (g_mean + 1))

  rnd_g <- function(x) round(x, 4)
  write_golden("g", "basic",
    inputs = list(keys = g_keys, numerators = g_num),
    expected = list(
      targets = rep(rnd_g(g_median), n_g),
      values = rnd_g(g_num),
      ul99 = rep(rnd_g(g_mean + 3 * g_sigma), n_g),
      ul95 = rep(rnd_g(g_mean + 2 * g_sigma), n_g),
      ul68 = rep(rnd_g(g_mean + 1 * g_sigma), n_g),
      ll68 = rep(0, n_g),
      ll95 = rep(0, n_g),
      ll99 = rep(0, n_g)
    ),
    reference = "Benneyan 1998, Geometric distribution SPC (sigma = sqrt(mean*(mean+1)))",
    precision = 2,
    source_note = paste0("Custom R calculation (geometric sigma), ", R_VERSION)
  )
}

# --- T-chart --- CUSTOM: x^(1/3.6) transform, I-chart, back-transform with 3.6
{
  t_num <- c(16,20,5,13,1,26,46,12,12,5,19,4,3,15,14,9,8,15,21,6,3,1,56,117,1,33,9,9,19,12,1,16,13,18,1,35,16,5,21,38,3,25,3,11,13,20,9,3,8,21,24,38,8,13,9,1,30,23,3,7,22,19,11,31,6,1,1)
  t_keys <- as.character(1:67)
  n_t <- length(t_num)

  # Transform: y = x^(1/3.6)
  t_transformed <- t_num^(1 / 3.6)

  # I-chart on transformed data: mean centreline, AMR/d2 sigma
  t_cl_y <- mean(t_transformed)
  t_mr <- abs(diff(t_transformed))
  t_amr <- mean(t_mr)
  t_sigma_y <- t_amr / d2

  # Back-transform: result^3.6, clamp negatives to 0 before back-transform
  bt <- function(y) ifelse(y < 0, 0, y^3.6)

  rnd_t <- function(x) round(x, 4)
  write_golden("t", "basic",
    inputs = list(keys = t_keys, numerators = t_num),
    expected = list(
      targets = rep(rnd_t(bt(t_cl_y)), n_t),
      values = rnd_t(bt(t_transformed)),
      ul99 = rep(rnd_t(bt(t_cl_y + 3 * t_sigma_y)), n_t),
      ul95 = rep(rnd_t(bt(t_cl_y + 2 * t_sigma_y)), n_t),
      ul68 = rep(rnd_t(bt(t_cl_y + 1 * t_sigma_y)), n_t),
      ll68 = rep(rnd_t(bt(t_cl_y - 1 * t_sigma_y)), n_t),
      ll95 = rep(rnd_t(bt(t_cl_y - 2 * t_sigma_y)), n_t),
      ll99 = rep(rnd_t(bt(t_cl_y - 3 * t_sigma_y)), n_t)
    ),
    reference = "Nelson 1994, T-chart (x^(1/3.6) transform, I-chart, back-transform)",
    precision = 2,
    source_note = paste0("Custom R calculation (1/3.6 power transform), ", R_VERSION)
  )
}

# --- S-chart --- CUSTOM: pooled SD centreline, B3/B4 factors via c4/c5
# qicharts2 does not properly support pre-computed SDs as S-chart input.
{
  s_sds <- c(8.69,8.86,10.16,10.45,10.12,8.94,9.51,9.53,11.22,8.5,9.04,10.82,8.8,9.65,10.41,10.08,9.7,9.35,8.5,9.59,9.72,8.89,9.99,10.74,9.68,9.63,9.74,10.35,8.65,9.88,7.9,8.95,9.45,9.81,8.58,11.19)
  s_den <- c(52,64,70,60,67,69,67,54,79,59,49,61,41,51,56,43,57,48,69,41,40,46,59,62,57,65,75,70,76,69,64,67,84,67,69,78)
  n_s <- length(s_sds)

  # c4(n) = sqrt(2/(n-1)) * gamma(n/2) / gamma((n-1)/2)
  c4_fn <- function(n) sqrt(2 / (n - 1)) * gamma(n / 2) / gamma((n - 1) / 2)
  c5_fn <- function(n) sqrt(1 - c4_fn(n)^2)
  B3_fn <- function(n, k) 1 - k * c5_fn(n) / c4_fn(n)
  B4_fn <- function(n, k) 1 + k * c5_fn(n) / c4_fn(n)

  # Pooled SD: sqrt(sum((n_i - 1) * s_i^2) / sum(n_i - 1))
  s_cl <- sqrt(sum((s_den - 1) * s_sds^2) / sum(s_den - 1))

  rnd_s <- function(x) round(x, 4)
  write_golden("s", "basic",
    inputs = list(keys = p_keys, numerators = s_sds, denominators = s_den),
    expected = list(
      targets = rep(rnd_s(s_cl), n_s),
      values = rnd_s(s_sds),
      ul99 = rnd_s(s_cl * sapply(s_den, B4_fn, k = 3)),
      ul95 = rnd_s(s_cl * sapply(s_den, B4_fn, k = 2)),
      ul68 = rnd_s(s_cl * sapply(s_den, B4_fn, k = 1)),
      ll68 = rnd_s(s_cl * sapply(s_den, B3_fn, k = 1)),
      ll95 = rnd_s(s_cl * sapply(s_den, B3_fn, k = 2)),
      ll99 = rnd_s(s_cl * sapply(s_den, B3_fn, k = 3))
    ),
    reference = "Montgomery 2009, Chapter 6 (S-chart, B3/B4 via c4/c5)",
    precision = 2,
    source_note = paste0("Custom R calculation (c4/c5/B3/B4 factors), ", R_VERSION)
  )
}

# --- XBar-chart ---
xbar_num <- c(66.88,68.76,67.75,67.05,67.2,67.43,69.23,71.12,67.63,69.97,66.67,67.76,69.32,66.04,67.61,69.69,67.62,67.31,68.41,64.73,68.28,69.34,66.53,66.67,67.27,67.69,67.6,67.29,68.47,66.82,68.87,66.75,67.41,69.87,68.19,66.04)
xbar_sds <- c(8.69,8.86,10.16,10.45,10.12,8.94,9.51,9.53,11.22,8.5,9.04,10.82,8.8,9.65,10.41,10.08,9.7,9.35,8.5,9.59,9.72,8.89,9.99,10.74,9.68,9.63,9.74,10.35,8.65,9.88,7.9,8.95,9.45,9.81,8.58,11.19)

# NOTE: qicharts2 xbar chart expects raw subgroup data. Since we only have
# subgroup means and SDs, we generate the golden data using the project's own
# formulas. Run this section only if you have raw subgroup data available.
# For now, we skip xbar in qicharts2 and rely on the seeded TypeScript values.
cat("  SKIPPED: xbar (qicharts2 requires raw subgroup data, not pre-computed means)\n")

# --- U-chart (raw rates, no multiplier) ---
u_num <- c(575,521,585,528,507,519,457,505,494,512,543,506,509,521,549,531,509,528,419,512,495,513,454,490)
u_den <- c(310466.8333,282346.7917,309089.7083,287977.3333,297743.375,286988.25,261120.3333,268720.75,284437.875,290449.5,288104.4583,279961.375,289803.9583,275950.5833,290824.4583,285495.75,282515.2083,273927.875,253085.625,262410.7083,275529.25,282405.0833,259530.7917,256235.4583)
u_keys <- c("2015-01-01","2015-02-01","2015-03-01","2015-04-01","2015-05-01",
             "2015-06-01","2015-07-01","2015-08-01","2015-09-01","2015-10-01",
             "2015-11-01","2015-12-01","2016-01-01","2016-02-01","2016-03-01",
             "2016-04-01","2016-05-01","2016-06-01","2016-07-01","2016-08-01",
             "2016-09-01","2016-10-01","2016-11-01","2016-12-01")

qic_u <- qic(u_num, n = u_den, chart = "u")
write_golden("u", "basic",
  inputs = list(keys = u_keys, numerators = u_num, denominators = u_den),
  expected = extract_limits(qic_u, 6, clamp_nonneg),
  reference = "Montgomery 2009, Chapter 7 (Rate per unit)",
  precision = 6
)

# --- Run chart ---
run_num <- c(12,15,11,18,14,13,16,19,12,14,17,11,15,13,16,18,12,14)
run_keys <- c("2020-01-01","2020-02-01","2020-03-01","2020-04-01","2020-05-01",
              "2020-06-01","2020-07-01","2020-08-01","2020-09-01","2020-10-01",
              "2020-11-01","2020-12-01","2021-01-01","2021-02-01","2021-03-01",
              "2021-04-01","2021-05-01","2021-06-01")

qic_run <- qic(run_num, chart = "run")
run_data <- qic_run$data
rnd5 <- function(x) round(x, 7)
write_golden("run", "basic",
  inputs = list(keys = run_keys, numerators = run_num),
  expected = list(targets = rnd5(run_data$cl), values = rnd5(run_data$y)),
  reference = "Carey 2003, Run chart (median only)",
  precision = 5,
  source_note = SOURCE
)

# =============================================================================
# CHARTS WITHOUT qicharts2 SUPPORT (custom R implementations)
# i_m, i_mm, pp, up: not in qicharts2 at all
# =============================================================================

im_num <- c(12,15,11,18,14,13,16,19,12,14,17,11,15,13,16,18,12,14)
im_keys <- run_keys

# --- I-median chart (median centreline, AMR sigma) ---
{
  vals <- im_num
  cl <- median(vals)
  mr <- abs(diff(vals))
  amr <- mean(mr)
  sigma <- amr / d2

  n <- length(vals)
  rnd <- function(x) round(x, 6)
  expected <- list(
    targets = rep(rnd(cl), n),
    values = rnd(vals),
    ul99 = rep(rnd(cl + 3 * sigma), n),
    ul95 = rep(rnd(cl + 2 * sigma), n),
    ul68 = rep(rnd(cl + 1 * sigma), n),
    ll68 = rep(rnd(cl - 1 * sigma), n),
    ll95 = rep(rnd(cl - 2 * sigma), n),
    ll99 = rep(rnd(cl - 3 * sigma), n)
  )

  write_golden("i_m", "basic",
    inputs = list(keys = im_keys, numerators = im_num),
    expected = expected,
    reference = "I-chart with median centreline, AMR/d2 sigma",
    precision = 4,
    source_note = paste0("Custom R calculation, ", R_VERSION)
  )
}

# --- I-median-MR chart (median centreline, median MR sigma) ---
{
  vals <- im_num
  cl <- median(vals)
  mr <- abs(diff(vals))
  mmr <- median(mr)
  sigma <- mmr / d2

  n <- length(vals)
  rnd <- function(x) round(x, 6)
  expected <- list(
    targets = rep(rnd(cl), n),
    values = rnd(vals),
    ul99 = rep(rnd(cl + 3 * sigma), n),
    ul95 = rep(rnd(cl + 2 * sigma), n),
    ul68 = rep(rnd(cl + 1 * sigma), n),
    ll68 = rep(rnd(cl - 1 * sigma), n),
    ll95 = rep(rnd(cl - 2 * sigma), n),
    ll99 = rep(rnd(cl - 3 * sigma), n)
  )

  write_golden("i_mm", "basic",
    inputs = list(keys = im_keys, numerators = im_num),
    expected = expected,
    reference = "I-chart with median centreline, MMR/d2 sigma",
    precision = 4,
    source_note = paste0("Custom R calculation, ", R_VERSION)
  )
}

# --- P'-chart (Laney, z-score MR method) ---
{
  pp_num <- c(266501,264225,276532,281461,269071,261215,270409,279778,270483,270320,
              267923,271478,255353,256820,261835,259144,255910,260863,264465,260989)
  pp_den <- c(280443,276823,291681,296155,282343,275888,283867,295251,284468,282529,
              279618,283932,266629,268091,276803,271578,266005,273520,278574,273772)
  pp_keys <- as.character(1:20)

  n <- length(pp_num)
  p_hat <- pp_num / pp_den
  p_bar <- sum(pp_num) / sum(pp_den)

  # z-scores: (p_hat - p_bar) / sqrt(p_bar * (1-p_bar) / n_i)
  binomial_sigma <- sqrt(p_bar * (1 - p_bar) / pp_den)
  z <- (p_hat - p_bar) / binomial_sigma

  # Sigma from moving range of z-scores
  mr_z <- abs(diff(z))
  sigma_z <- mean(mr_z) / d2

  # Limits in proportion space
  ul99 <- p_bar + 3 * sigma_z * binomial_sigma
  ul95 <- p_bar + 2 * sigma_z * binomial_sigma
  ul68 <- p_bar + 1 * sigma_z * binomial_sigma
  ll68 <- p_bar - 1 * sigma_z * binomial_sigma
  ll95 <- p_bar - 2 * sigma_z * binomial_sigma
  ll99 <- p_bar - 3 * sigma_z * binomial_sigma

  # Clamp to [0, 1]
  ul99 <- pmin(1, pmax(0, ul99))
  ul95 <- pmin(1, pmax(0, ul95))
  ul68 <- pmin(1, pmax(0, ul68))
  ll68 <- pmin(1, pmax(0, ll68))
  ll95 <- pmin(1, pmax(0, ll95))
  ll99 <- pmin(1, pmax(0, ll99))

  rnd <- function(x) round(x, 6)
  write_golden("pp", "basic",
    inputs = list(keys = pp_keys, numerators = pp_num, denominators = pp_den),
    expected = list(
      targets = rep(rnd(p_bar), n),
      values = rnd(p_hat),
      ul99 = rnd(ul99), ul95 = rnd(ul95), ul68 = rnd(ul68),
      ll68 = rnd(ll68), ll95 = rnd(ll95), ll99 = rnd(ll99)
    ),
    reference = "Laney 2002, P-prime chart with MR-based sigma",
    precision = 4,
    source_note = paste0("Custom R calculation (Laney method), ", R_VERSION)
  )
}

# --- U'-chart (Laney, z-score MR method for rates) ---
{
  # Uses same data as P'-chart (these are large counts, so also valid as rates)
  up_num <- pp_num
  up_den <- pp_den
  up_keys <- pp_keys

  n <- length(up_num)
  u_hat <- up_num / up_den
  u_bar <- sum(up_num) / sum(up_den)

  # z-scores: (u_hat - u_bar) / sqrt(u_bar / n_i)
  poisson_sigma <- sqrt(u_bar / up_den)
  z <- (u_hat - u_bar) / poisson_sigma

  # Sigma from moving range of z-scores
  mr_z <- abs(diff(z))
  sigma_z <- mean(mr_z) / d2

  # Limits in rate space
  ul99 <- u_bar + 3 * sigma_z * poisson_sigma
  ul95 <- u_bar + 2 * sigma_z * poisson_sigma
  ul68 <- u_bar + 1 * sigma_z * poisson_sigma
  ll68 <- u_bar - 1 * sigma_z * poisson_sigma
  ll95 <- u_bar - 2 * sigma_z * poisson_sigma
  ll99 <- u_bar - 3 * sigma_z * poisson_sigma

  # Clamp lower limits to 0
  ll68 <- pmax(0, ll68)
  ll95 <- pmax(0, ll95)
  ll99 <- pmax(0, ll99)

  rnd <- function(x) round(x, 6)
  write_golden("up", "basic",
    inputs = list(keys = up_keys, numerators = up_num, denominators = up_den),
    expected = list(
      targets = rep(rnd(u_bar), n),
      values = rnd(u_hat),
      ul99 = rnd(ul99), ul95 = rnd(ul95), ul68 = rnd(ul68),
      ll68 = rnd(ll68), ll95 = rnd(ll95), ll99 = rnd(ll99)
    ),
    reference = "Laney 2002, U-prime chart with MR-based sigma",
    precision = 4,
    source_note = paste0("Custom R calculation (Laney method), ", R_VERSION)
  )
}

cat("\nAll golden datasets generated.\n")
cat("Compare with TypeScript-seeded fixtures to identify any calculation differences.\n")

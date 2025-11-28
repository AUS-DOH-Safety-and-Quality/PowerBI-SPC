# First export the 'Screenshots.pbix' file to PDF
# The below will create a separate "screenshot-*.png" file for each
#   page in the .pbix
# Requires the 'poppler-utils' package
pdftoppm Screenshots.pdf screenshot -png -r 300 -scale-to-x 1366 -scale-to-y 768

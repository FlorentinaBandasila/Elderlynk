namespace Elderlynk.Services
{
    public static class CNPHelper
    {
        /// <summary>
        /// Extract birth date from Romanian CNP (Cod Numeric Personal)
        /// CNP format: SSYYMMDDSSSSSC
        /// First digit (S) determines century:
        /// 1,2 = 1900-1999
        /// 3,4 = 1800-1899
        /// 5,6 = 2000-2099
        /// 7,8,9 = 1900-1999
        /// </summary>
        public static DateTime? ExtractBirthDateFromCNP(string cnp)
        {
            if (string.IsNullOrWhiteSpace(cnp) || cnp.Length != 13)
                return null;

            try
            {
                char firstDigit = cnp[0];
                string yearStr = cnp.Substring(1, 2);
                string monthStr = cnp.Substring(3, 2);
                string dayStr = cnp.Substring(5, 2);

                if (!int.TryParse(yearStr, out int year) ||
                    !int.TryParse(monthStr, out int month) ||
                    !int.TryParse(dayStr, out int day))
                    return null;

                // Determine century based on first digit
                int fullYear = firstDigit switch
                {
                    '1' or '2' => 1900 + year,
                    '3' or '4' => 1800 + year,
                    '5' or '6' => 2000 + year,
                    '7' or '8' or '9' => 1900 + year,
                    _ => 0
                };

                if (fullYear == 0 || month < 1 || month > 12 || day < 1 || day > 31)
                    return null;

                return new DateTime(fullYear, month, day);
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Calculate age from Romanian CNP
        /// </summary>
        public static int? ExtractAgeFromCNP(string cnp)
        {
            var birthDate = ExtractBirthDateFromCNP(cnp);
            if (birthDate == null)
                return null;

            var today = DateTime.Today;
            var age = today.Year - birthDate.Value.Year;

            if (birthDate.Value.Date > today.AddYears(-age))
                age--;

            return age;
        }
    }
}

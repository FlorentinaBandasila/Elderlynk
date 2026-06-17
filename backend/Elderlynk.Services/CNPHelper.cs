namespace Elderlynk.Services
{
    public static class CNPHelper
    {
        // Control-digit weights used by the official CNP checksum algorithm.
        private static readonly int[] ControlWeights = { 2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9 };

        /// <summary>
        /// Validates a Romanian CNP (Cod Numeric Personal): 13 digits, a plausible
        /// birth date encoded in positions 1-6, and a correct control digit.
        /// </summary>
        public static bool IsValidCNP(string? cnp)
        {
            if (string.IsNullOrWhiteSpace(cnp) || cnp.Length != 13)
                return false;

            // Must be all digits, and the first digit (sex/century) cannot be 0.
            foreach (var c in cnp)
            {
                if (c < '0' || c > '9')
                    return false;
            }
            if (cnp[0] == '0')
                return false;

            // The encoded birth date must be valid.
            if (ExtractBirthDateFromCNP(cnp) == null)
                return false;

            // Control digit: sum(digit_i * weight_i) % 11; 10 maps to 1.
            int sum = 0;
            for (int i = 0; i < 12; i++)
                sum += (cnp[i] - '0') * ControlWeights[i];

            int control = sum % 11;
            if (control == 10)
                control = 1;

            return control == (cnp[12] - '0');
        }

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

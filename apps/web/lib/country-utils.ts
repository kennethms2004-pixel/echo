import * as ct from "countries-and-timezones";

export function getCountryFromTimezone(timezone?: string) {
  if (!timezone) {
    return null;
  }

  const timezoneInfo = ct.getTimezone(timezone);

  if (!timezoneInfo?.countries.length) {
    return null;
  }

  const countryCode = timezoneInfo.countries[0] as string;
  const country = ct.getCountry(countryCode);

  return {
    code: countryCode,
    name: country?.name ?? countryCode
  };
}

export function getCountryFlagUrl(countryCode: string) {
  return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}

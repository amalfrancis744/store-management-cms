export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const willTokenExpireSoon = (
  token: string,
  thresholdMinutes = 5
): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now() + thresholdMinutes * 60 * 1000;
  } catch {
    return true;
  }
};

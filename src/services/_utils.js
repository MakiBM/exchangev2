export const buildApiUrl = (API_URL, urlParts, params = {}) => {
  // Ensure all components are URL encoded.
  urlParts = urlParts
    .split('/')
    .map(component => encodeURIComponent(component))
    .join('/')
  params = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&')
  const url = `${API_URL}/${urlParts}`
  return params ? `${url}?${params}` : url
}

export const sleep = (timeout) => new Promise(resolve => setTimeout(resolve, timeout))

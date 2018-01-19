export function fetchAddresses(url, query) {
  return fetch(`${url}${query}`)
           .then(response => response.json())
           .catch(() => { return { error: 'Ошибка получения адресов' } })
}

export function fetchHouses(url, id) {
  return fetch(`${url}${id}`)
           .then(response => response.json())
           .catch(() => { return { error: 'Ошибка получения номеров домов' } })
}

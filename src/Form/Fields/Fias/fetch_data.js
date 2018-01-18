export function fetchAddresses(context, url, query) {
  fetch(`${url}${query}`)
    .then(response => response.json())
    .then(addresses => {
      context._cleanState()
      context.setState({ addresses, load: false, display: 'block' })
    })
}

export function fetchHouses(context, url, id) {
  fetch(`${url}${id}`)
      .then(response => response.json())
      .then(json => {
        context.setState({
          addr_obj: json.addr_obj,
          houses: json.houses,
          load: false
        })
      })
}

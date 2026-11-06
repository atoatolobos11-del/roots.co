export const categories = [
  {
    id: 'gray',
    name: 'Gray',
    image: '/images/products/2.jpg',
    alt: 'Gray ROOTS logo T-shirt',
  },
  {
    id: 'red',
    name: 'Red',
    image: '/images/products/3.jpg',
    alt: 'Red ROOTS logo T-shirt',
  },
  {
    id: 'black',
    name: 'Black',
    image: '/images/products/4.jpg',
    alt: 'Black ROOTS logo T-shirt',
  },
  {
    id: 'blue',
    name: 'Blue',
    image: '/images/products/6.jpg',
    alt: 'Royal blue graphic T-shirt',
  },
  {
    id: 'green',
    name: 'Green',
    image: '/images/products/7.jpg',
    alt: 'Forest green graphic T-shirt',
  },
  {
    id: 'nature',
    name: 'Nature',
    image: '/images/products/10.jpg',
    alt: 'White ROOTS nature graphic T-shirt',
  },
]

export const filters = categories.map(({ id, name }) => ({ id, name }))

export const categoryCounts = {
  gray: 1,
  red: 1,
  black: 1,
  blue: 1,
  green: 1,
  nature: 1,
}

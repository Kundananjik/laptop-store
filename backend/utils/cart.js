function mapCart(cartDocument) {
  const items = cartDocument.items.map((item) => ({
    itemId: item._id.toString(),
    laptopId: item.laptop._id.toString(),
    title: item.laptop.title,
    brand: item.laptop.brand,
    image: item.laptop.image,
    price: item.laptop.price,
    stock: item.laptop.quantity,
    quantity: item.quantity,
    lineTotal: item.quantity * item.laptop.price,
  }));

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cartDocument._id.toString(),
    sessionId: cartDocument.sessionId,
    items,
    total,
    itemCount,
  };
}

module.exports = {
  mapCart,
};

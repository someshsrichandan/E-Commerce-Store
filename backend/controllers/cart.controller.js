export const getCartProducts = async (req, res) => {
    try {
        const products =  await Product.find({ _id: { $in: req.user.cartItems } });

        const cartItems = req.user.cartItems.map((product) => {
            const item = req.user.cartItems.find((cartItem) => cartItem.id === product.id);
            return { ...product.toJson(), quantity: item.quantity };
        });

        res.json(cartItems);
    } catch (error) {
        console.log("error in getCartProducts controller", error);
        res.status(500).json({ message: error.message });
        
    }
}


export const addToCart = async (req, res) => {
    try {
        const {productId} = req.body;
        const user = req.user;
        const existingCart = await Cart.find(item => item.id=== productId);
        if(existingCart){
            existingCart.quantity += 1;
        } else {
            user.cartItems.push(productId);
        }
        await user.save();
        res.json(user.cartItems);
        
    } catch (error) {
        console.log("error in addToCart controller", error);
        res.status(500).json({ message: error.message });
    }
}

export const removeAllFromCart = async (req, res) => {
  try {
    const {productId} = req.body;
    const user = req.user;
    if(!productId){
        user.cartItems = [];
    } else {
        user.cartItems = user.cartItems.filter(item => item !== productId);
    }
    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    console.log("error in removeAllFromCart controller", error);
    res.status(500).json({ message: error.message });
  }  
}

export const updateQuantity = async (req, res) => {
    try {
        const{id:productId} = req.params;
        const {quantity} = req.body;
        const user = req.user;
        const existingCart = await Cart.find(item => item.id=== productId);
        if(existingCart ){
            if(quantity === 0){
                user.cartItems = user.cartItems.filter(item => item !== productId);
                await user.save();
                return res.json(user.cartItems);
            }else{
                existingCart.quantity = quantity;
                await user.save();
                return res.json(user.cartItems);
            }
        }else{
           return res.status(404).json({ message: "Item not found in cart" });
        }

    } catch (error) {
        console.log("error in updateQuantity controller", error);
        res.status(500).json({ message: error.message });
        
    }
}
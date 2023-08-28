const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');

const productModel = require('../models/productModel')
const couponModel = require('../models/couponModel');
const cartModel = require('../models/cartModel');

// fuction calc total price
const calcTotalPrice = (cart) => {
    // calculate Total Price
    let totalPrice = 0;

    cart.cartItems.forEach((item) => {
        totalPrice += item.quantity * item.price;
    })
    cart.totalPriceAfterDiscount = undefined;
    return totalPrice.toFixed(2);
}


//@desc   Add Product to Cart
//@route   POST   /api/v1/cart
//@access  Private/Protect/user only
exports.addProductToCart = asyncHandler(async (req, res, next) => {
    const { productId, color, size } = req.body;

    const product = await productModel.findById(productId);

    // 1) Get cart for logged user
    let cart = await cartModel.findOne({ user: req.user._id });

    if (!cart) {
        // scenario 1 => If not have cart, Create a new cart to this logged user with product 
        cart = await cartModel.create({
            user: req.user._id,
            cartItems: [{
                product: productId, color, size, price: product.price
            }],
        })
    } else {
        // scenario 2 => logged user have cart get product index 
        const productIndex = cart.cartItems.findIndex((item) => item.product.toString() === productId && item.color === color && item.size === size) // get product index

        //scenario 3 => found product in cartItems, product exist in cartItems  Update product quantity
        if (productIndex > -1) {
            const cartItem = cart.cartItems[productIndex];
            cartItem.quantity += 1;
            // insert new value into product
            cart.cartItems[productIndex] = cartItem;
        } else {
            //scenario 4 => Not found product exist in cartItems ,push product into cartItems
            cart.cartItems.push({ product: productId, color, size, price: product.price })
        }
    }

    // calculate Total Price
    cart.totalCartPrice = calcTotalPrice(cart);

    await cart.save();

    res.status(200).json({ status: 'Success', message: 'Product added to cart successfully.', numOfCartItems: cart.cartItems.length, data: cart });
})


//@desc    Get logged user Cart
//@route   GET   /api/v1/cart
//@access  Private/Protect/user only
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
    const cart = await cartModel.findOne({ user: req.user._id });

    if (!cart) {
        return next(new ApiError(`There is no Cart for this userId:'${req.user._id}'`, 404))
    }

    res.status(200).json({ status: 'success', numOfCartItems: cart.cartItems.length, data: cart })
})


//@desc    Remove Product from logged user Cart
//@route   Delete   /api/v1/cart/:itemId
//@access  Private/Protect/user only
exports.removeProductFromCart = asyncHandler(async (req, res, next) => {
    // $pull : remove itemId from cartItems array if itemId is exsist
    const cart = await cartModel.findOneAndUpdate({ user: req.user._id },
        {
            $pull: { cartItems: { _id: req.params.itemId } }
        }, { new: true });

    if (!cart) {
        return next(new ApiError(`There is no Cart for this userId:'${req.user._id}'`, 404))
    }

    // calculate Total Price
    cart.totalCartPrice = calcTotalPrice(cart);
    await cart.save();

    res.status(200).json({ status: 'success', numOfCartItems: cart.cartItems.length, data: cart });
})


//@desc    Clear logged user Cart
//@route   Delete   /api/v1/cart/
//@access  Private/Protect/user only
exports.clearUserCart = asyncHandler(async (req, res, next) => {
    await cartModel.findOneAndDelete({ user: req.user._id });
    res.status(200).json({ status: 'success', message: 'Delete all items from cart sussecfully' });
})


//@desc    Update specific cart item quantity
//@route   PUT   /api/v1/cart/:itemId
//@access  Private/Protect/user only
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
    const { quantity } = req.body;

    const cart = await cartModel.findOne({ user: req.user._id })

    if (!cart) {
        return next(new ApiError(`There is no Cart for this userId:'${req.user._id}'`, 404))
    }

    const itemIndex = cart.cartItems.findIndex(item => item._id.toString() === req.params.itemId)
    if (itemIndex > -1) {
        const item = cart.cartItems[itemIndex]
        item.quantity = quantity;
        cart.cartItems[itemIndex] = item;
    } else {
        return next(new ApiError(`There is no item for this id:'${req.params.itemId}'`, 404));
    }

    // calculate Total Price
    cart.totalCartPrice = calcTotalPrice(cart);
    await cart.save();


    res.status(200).json({ status: 'success', message: 'Update quantity sucessfully.', numOfCartItems: cart.cartItems.length, data: cart });
})



//@desc    Apply coupon on logged user cart
//@route   PUT   /api/v1/cart/coupon
//@access  Private/Protect/user only
exports.applyCoupon = asyncHandler(async (req, res, next) => {
    //1) Get coupon based on the name
    const coupon = await couponModel.findOne({ name: req.body.coupon, expires: { $gt: Date.now() } });

    if (!coupon) {
        return next(new ApiError(`Coupon is Invalid or Expired`, 404))
    }

    // 2) Get logged user cart to get total cart price
    const cart = await cartModel.findOne({ user: req.user._id });

    if (!cart) {
        return next(new ApiError(`There is no Cart for this userId:'${req.user._id}'`, 404))
    }

    const totalPrice = cart.totalCartPrice;

    // 3) Calculate price after priceAfterDiscount
    const totalPriceAfterDiscount = (totalPrice - (totalPrice * coupon.discount) / 100).toFixed(2); //99.50

    cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
    await cart.save();

    res.status(200).json({ status: 'success', coupon: `${req.body.coupon}`, numOfCartItems: cart.cartItems.length, data: cart });
})


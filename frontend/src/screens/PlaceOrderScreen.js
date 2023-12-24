import React, {useState, useEffect} from 'react'
import { Link, useNavigate, useLocation  } from 'react-router-dom'
import { Button, Row, Col, ListGroup, Image, Card} from 'react-bootstrap'

import { useDispatch, useSelector} from 'react-redux'
import Message from '../components/Message'
import CheckoutSteps from '../components/CheckoutSteps'
import { createOrder } from '../actions/orderActions'
import { ORDER_CREATE_RESET } from '../constants/orderConstants'

function PlaceOrderScreen() {

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const cart = useSelector(state => state.cart)
    const updatCart = {
        ...cart,
        itemsPrice: cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2),
      }
    const updateCart = {
        ...updatCart,
        shippingPrice: (updatCart.itemsPrice > 100 ? 0 : 10).toFixed(2),
      }
    const updatedCart = {
        ...updateCart,
        totalPrice: (Number(updateCart.itemsPrice) + Number(updateCart.shippingPrice)).toFixed(2),
      }
    const orderCreate = useSelector(state => state.orderCreate)
    const {order, error, success} = orderCreate

    if(!cart.paymentMethod){
        navigate('/payment')
    }

    useEffect(() => {
        if(success){
            navigate(`/order/${order._id}`)
            dispatch({type: ORDER_CREATE_RESET})
        }
    }, [success, navigate])

    const placeOrder = () => {
        dispatch(createOrder({
            orderItems: cart.cartItems,
            shippingAddress: cart.shippingAddress,
            paymentMethod: cart.paymentMethod,
            itemsPrice: updatedCart.itemsPrice,
            shippingPrice: updatedCart.shippingPrice,
            totalPrice: updatedCart.totalPrice,
        }))
    }

  return (
    <div>
        <CheckoutSteps step1 step2 step3 step4 />
        <div className="d-flex justify-content-center">
            <Message variant='info'>Orders over $100 are delivered for free.</Message>
        </div>
        <Row>
            <Col md={8}>
                <ListGroup variant='flush'>
                    <ListGroup.Item>
                        <h2>Shipping</h2>
                        <p>
                            <strong>Shipping: </strong>
                            {cart.shippingAddress.address}, {cart.shippingAddress.postalCode}
                            {'   '}
                            {cart.shippingAddress.city},
                            {'   '}
                            {cart.shippingAddress.country}
                        </p>
                    </ListGroup.Item>

                    <ListGroup.Item>
                        <h2>Payment Method</h2>
                        <p>
                            <strong>Method: </strong>
                            {cart.paymentMethod}
                        </p>
                    </ListGroup.Item>

                    <ListGroup.Item>
                        <h2>Order Items</h2>
                        {cart.cartItems.length === 0 ? <Message variant='info'>
                            Your cart is empty.
                        </Message> : (
                            <ListGroup variant='flush'>
                                {cart.cartItems.map((item, index) => (
                                    <ListGroup.Item key={index}>
                                        <Row>
                                            <Col md={1}>
                                            <Image src={item.image} alt={item.name} fluid rounded />
                                            </Col>

                                            <Col>
                                            <Link to={`/product/${item.product}`}>{item.name}</Link>
                                            </Col>

                                            <Col md={4}>
                                                {item.qty} X ${item.price} = ${(item.qty * item.price).toFixed(2)}
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        )}
                        
                        
                    </ListGroup.Item>
                </ListGroup>
            </Col>

            <Col md={4}>
                <Card>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h2>Order Summary</h2>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <Row>
                                <Col>Items:</Col>
                                <Col>${updatedCart.itemsPrice}</Col>
                            </Row>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <Row>
                                <Col>Shipping:</Col>
                                <Col>${updatedCart.shippingPrice}</Col>
                            </Row>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <Row>
                                <Col>Total:</Col>
                                <Col>${updatedCart.totalPrice}</Col>
                            </Row>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            {error && <Message variant='danger'>{error}</Message>}
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <Button
                                type='button'
                                className='btn-block'
                                disabled={updatedCart.cartItems === 0}
                                onClick={placeOrder}
                            >
                                Place Order
                            </Button>
                        </ListGroup.Item>
                    </ListGroup>
                </Card>
            </Col>
        </Row>
    </div>
  )
}

export default PlaceOrderScreen

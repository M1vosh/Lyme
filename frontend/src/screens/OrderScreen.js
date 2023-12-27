import React, {useState, useEffect} from 'react'
import { Link, useNavigate, useLocation, useParams  } from 'react-router-dom'
import { Button, Row, Col, ListGroup, Image, Card} from 'react-bootstrap'

import { useDispatch, useSelector} from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { getOrderDetails, payOrder } from '../actions/orderActions'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"; 
import moment from 'moment'
//AXYF0U358O_oIdHcK9rpNqFgYrxlQiZHgr6RiuZ2A2H9eVEYPmRcMOGQbm1QSPGUfQLdtrntbATt4Yjf

function OrderScreen() {
    const params = useParams()
    const orderId  = params.id

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const orderDetails = useSelector(state => state.orderDetails)
    const {order:orderDets, error, loading} = orderDetails


    let itemsPrice
    if(!loading && !error){
        itemsPrice =  orderDets.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
    }


    useEffect(() => {
        if(!orderDets || orderDets._id !== Number(orderId)) {
            dispatch(getOrderDetails(orderId))
        }
    }, [dispatch, orderDets, orderId])

    const successPaymentHandler = (paymentResult) => {
        dispatch(payOrder(orderId,paymentResult))
        window.location.reload()
    }
    


  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : (
    <div>
        <h1>Order: {orderDets._id}</h1>
        <Row>
            <Col md={8}>
                <ListGroup variant='flush'>
                    <ListGroup.Item>
                        <h2>Shipping</h2>
                        <p><strong>Name: </strong> {orderDets.user.name} </p>
                        <p><strong>Email: </strong><a href={`mailto:${orderDets.user.email}`}>{orderDets.user.email}</a></p>
                        <p>
                            <strong>Shipping: </strong>
                            {orderDets.shippingAddress.address}, {orderDets.shippingAddress.postalCode}
                            {'   '}
                            {orderDets.shippingAddress.city},
                            {'   '}
                            {orderDets.shippingAddress.country}
                        </p>
                        {orderDets.isDelivered ? (
                            <Message variant='success'>
                                Your order has been delivered on{' '}{moment(orderDets.deliveredAt).format('MMMM Do, YYYY')}
                            </Message>
                        ) : !orderDets.isPaid ? (
                            <Message variant='warning'>Waiting for payment...</Message>
                        ) : (
                            <Message variant='info'>Your order is being processed</Message>
                        )}
                    </ListGroup.Item>

                    <ListGroup.Item>
                        <h2>Payment Method</h2>
                        <p>
                            <strong>Method: </strong>
                            {orderDets.paymentMethod}
                        </p>
                        {orderDets.isPaid ? (
                            <Message variant='success'>
                                Your order has been paid on{' '}{moment(orderDets.paidAt).format('MMMM Do, YYYY')}
                            </Message>
                        ) : (
                            <Message variant='warning'>Your order has not been paid yet</Message>
                        )}
                    </ListGroup.Item>

                    <ListGroup.Item>
                        <h2>Order Items</h2>
                        {orderDets.orderItems.length === 0 ? <Message variant='info'>
                            Order is empty.
                        </Message> : (
                            <ListGroup variant='flush'>
                                {orderDets.orderItems.map((item, index) => (
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
                                <Col>${itemsPrice}</Col>
                            </Row>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <Row>
                                <Col>Shipping:</Col>
                                <Col>${orderDets.shippingPrice}</Col>
                            </Row>
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <Row>
                                <Col>Total:</Col>
                                <Col>${orderDets.totalPrice}</Col>
                            </Row>
                        </ListGroup.Item>

                        {!orderDets.isPaid && (
                            <ListGroup.Item>
                                <PayPalScriptProvider options={{ "client-id": "AXYF0U358O_oIdHcK9rpNqFgYrxlQiZHgr6RiuZ2A2H9eVEYPmRcMOGQbm1QSPGUfQLdtrntbATt4Yjf" }}>
                                    <PayPalButtons 
                                        className='mt-3'  
                        
                                        createOrder={(data,actions)=>{
                                            return actions.order.create({
                                                purchase_units: [
                                                    {
                                                        amount: {
                                                            currency_code:'USD',
                                                            value: orderDets.totalPrice,
                                                        },
                                                    },
                                                ],
                                            });
                                        }}
                                        onApprove={successPaymentHandler}
                                    /> 
                                </PayPalScriptProvider>
                            </ListGroup.Item>
                        )}


                    </ListGroup>
                </Card>
            </Col>
        </Row>
    </div>
  )
}

export default OrderScreen
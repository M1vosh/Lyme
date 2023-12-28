import React, {useState, useEffect} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { Row, Col } from 'react-bootstrap'
import Product from '../components/Product'
import Loader from '../components/Loader'
import Message from '../components/Message'
import { listProducts } from '../actions/productActions'
import ProductCarousel from '../components/ProductCarousel'
//import axios from 'axios'

function HomeScreen() {
  //const[products, setProducts] = useState([])
  const dispatch = useDispatch()
  const productList = useSelector(state => state.productList)
  const {error, loading, products} = productList

  const location = useLocation()
  const keyword = new URLSearchParams(location.search).get('keyword')

  useEffect(() => {
    dispatch(listProducts(keyword))

  }, [dispatch, keyword])


  return (
    <div>
      {!keyword && <ProductCarousel />}
      <h1>Latest products</h1>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error}</Message>
      ) : products.length === 0 ? (
        <Message variant='info'>No products matching the keyword.</Message>
      ) : (
        <Row>
          {products.map((product) => (
            <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
              <Product product={product} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}

export default HomeScreen

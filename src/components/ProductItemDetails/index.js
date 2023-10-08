// Write your code here
import {Component} from 'react'
import {Link} from 'react-router-dom'
import {Loader} from 'react-loader-spinner'
import Cookies from 'js-cookie'
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'
import Header from '../Header'
import SimilarProductItem from '../SimilarProductItem'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class ProductItemDetails extends Component {
  state = {
    apiStatus: apiStatusConstants.initial,
    productsList: {},
    similarProducts: [],
    quantity: 1,
  }

  componentDidMount() {
    this.getDetails()
  }

  onDecrement = () => {
    const {quantity} = this.state
    if (quantity > 1) {
      this.setState(prevState => ({quantity: prevState.quantity - 1}))
    }
  }

  onIncrement = () => {
    this.setState(prevState => ({quantity: prevState.quantity + 1}))
  }

  getFormattedData = data => ({
    id: data.id,
    imageUrl: data.image_url,
    title: data.title,
    brand: data.brand,
    totalReviews: data.total_reviews,
    rating: data.rating,
    availability: data.availability,
    price: data.price,
    description: data.description,
  })

  getDetails = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const {match} = this.props
    const {params} = match
    const {id} = params
    const apiUrl = `https://apis.ccbp.in/products/${id}`
    const jwtToken = Cookies.get('jwt_token')
    const option = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    }
    const response = await fetch(apiUrl, option)
    if (response.ok) {
      const fetchedData = await response.json()
      const updatedData = this.getFormattedData(fetchedData)

      const updatedSimilarProductsData = fetchedData.similar_products.map(
        eachSimilarProduct => this.getFormattedData(eachSimilarProduct),
      )

      this.setState({
        productsList: updatedData,
        similarProducts: updatedSimilarProductsData,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  renderLoadingView = () => (
    <div data-testid="loader">
      <Loader type="ThreeDots" color="#0b69ff" height={80} width={80} />
    </div>
  )

  renderFailureView = () => (
    <div className="failure-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        alt="failure view"
        className="error-view-img"
      />
      <h1 className="failure-head">Product Not Found</h1>
      <Link to="/products">
        <button type="button" className="btn">
          Continue Shopping
        </button>
      </Link>
    </div>
  )

  renderProductDetailsView = () => {
    const {productsList, similarProducts, quantity} = this.state
    const {
      imageUrl,
      title,
      brand,
      totalReviews,
      rating,
      availability,
      price,
      description,
    } = productsList
    return (
      <div className="success-container">
        <div className="top-container">
          <img src={imageUrl} alt="product" className="img" />
          <div className="description-container">
            <h1 className="title-1">{title}</h1>
            <p className="price">Rs {price}/- </p>
            <div className="ratings-container">
              <div className="rating-container">
                <p className="rating">{rating}</p>
                <img
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  alt="star"
                  className="star"
                />
              </div>
              <p className="total-reviews">{totalReviews} Reviews</p>
            </div>
            <p className="description">{description}</p>
            <p className="para">
              Available: <span className="span">{availability}</span>
            </p>
            <p className="para">
              Brand: <span className="span">{brand}</span>
            </p>
            <hr className="line" />
            <div className="quantity-container">
              <button
                className="quantity-button"
                type="button"
                onClick={this.onDecrement}
                data-testid="minus"
              >
                <BsDashSquare className="icon" />
              </button>
              <p className="quantity">{quantity}</p>
              <button
                className="quantity-button"
                type="button"
                onClick={this.onIncrement}
                data-testid="plus"
              >
                <BsPlusSquare className="icon" />
              </button>
            </div>
            <button type="button" className="cart-btn">
              ADD TO CART
            </button>
          </div>
        </div>
        <h1 className="head">Similar Products</h1>

        <ul className="similar-products">
          {similarProducts.map(eachProduct => (
            <SimilarProductItem
              key={eachProduct.id}
              similarProduct={eachProduct}
            />
          ))}
        </ul>
      </div>
    )
  }

  renderView = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderProductDetailsView()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="product-details-container">
          {this.renderProductDetailsView()}
        </div>
      </>
    )
  }
}

export default ProductItemDetails

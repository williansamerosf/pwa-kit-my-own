import React, {useState} from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import {Text, Tooltip, Spinner} from '@chakra-ui/react'
import {useCommerceAPI} from '../../commerce-api/contexts'
//import {pluckIds} from '../../utils/utils'

const ProductDetails = ({product}) => {
    if (!product) {
        return <div>Loading..</div>
    }
    console.log(product)

    const api = useCommerceAPI()
    const [promotionMap, setPromotionMap] = useState({})
    const {productPromotions} = product

    const handleHover = (id) => {
        // Don't make a network request if you already loaded this data.
        if (promotionMap[id]) {
            return
        }
        const getPromotion = async (id) => {
            const promotions = await api.shopperPromotions.getPromotions({
                parameters: {ids: id}
            })
            setPromotionMap({...promotionMap, [id]: promotions.data[0]})
        }
        getPromotion(id)
    }

    return (
        <div className="t-product-details" itemScope itemType="http://schema.org/">
            <Text>This is the product: {product.name}</Text>
            {product && (
                <Helmet>
                    <title>{product.name}</title>
                    <meta name="description" content={product.name} />
                </Helmet>
            )}

            <Text>These are the promotions (if any):</Text>
            {productPromotions ?
                productPromotions.map(({promotionId, calloutMsg}) => (
                    <Tooltip
                        onOpen={() => {
                            handleHover(promotionId)
                        }}
                        key={promotionId}
                        label={
                            (promotionMap[promotionId] && promotionMap[promotionId].details) || (
                                <Spinner />
                            )
                        }
                        aria-label="Promotion details"
                    >
                        <Text>{calloutMsg}</Text>
                    </Tooltip>
                )) :
                <Text>This product didn't have any promotion</Text>
            }
        </div>
    )
}

ProductDetails.getTemplateName = () => 'product-details'

ProductDetails.shouldGetProps = async ({previousParams, params}) => {
    return !previousParams || previousParams.productId !== params.productId
}

ProductDetails.getProps = async ({params, api}) => {
    await api.auth.login()
    const product = await api.shopperProducts.getProduct({
        parameters: {id: params.productId, allImages: true}
    })

    // Returns a comma-separated list of ids from an array of objects
    // const promotionIds = pluckIds(product.productPromotions, 'promotionId')
    // // Get the promotions for the product
    // const promotions = await api.shopperPromotions.getPromotions({
    //     parameters: {ids: promotionIds}
    // })

    return {
        product: product
    }
}

ProductDetails.propTypes = {
    product: PropTypes.object,
    errorMessage: PropTypes.string,
    params: PropTypes.object,
    trackPageLoad: PropTypes.func
}

export default ProductDetails

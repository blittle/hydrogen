import Multipassify from 'multipassify';
import {NoStore, setCustomerAccessToken} from '@shopify/hydrogen';
import gql from 'graphql-tag';
import shopifyConfig from '../../../shopify.config';

export async function api(request, {queryShop}) {
  const multipassSecret = shopifyConfig.multipassSecret;

  // Todo: get customer email from session
  const customerEmail = 'michelle.ys.chen@gmail.com';

  const multipassToken = encodeCustomerData(multipassSecret, customerEmail);

  console.log('multipassToken', multipassToken);

  const {data, error} = await queryShop({
    query: LOGIN,
    variables: {
      multipassToken,
    },
    cache: NoStore(),
  });

  if (
    data &&
    data.customerAccessTokenCreateWithMultipass &&
    data.customerAccessTokenCreateWithMultipass.customerAccessToken !== null
  ) {
    const customerHeaders = setCustomerAccessToken(
      data.customerAccessTokenCreateWithMultipass.customerAccessToken,
    );

    return new Response(null, {
      headers: {
        ...customerHeaders,
        // Todo: maybe after login we want to go to a different page?
        Location: '/account',
      },
      status: 301,
    });
  } else {
    // Todo: redirect to an error page or login page
    return new Response(
      JSON.stringify({
        error: data
          ? data.customerAccessTokenCreateWithMultipass.customerUserErrors
          : error,
      }),
      {status: 401},
    );
  }
}

function encodeCustomerData(multipassSecret, customerEmail) {
  //Todo: this lib uses cryto that only works in NodeJS
  const multipassify = new Multipassify('SHOPIFY MULTIPASS SECRET');

  return multipassify.encode({
    email: customerEmail,
  });
}

const LOGIN = gql`
  mutation customerAccessTokenCreateWithMultipass($multipassToken: String!) {
    customerAccessTokenCreateWithMultipass(multipassToken: $multipassToken) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

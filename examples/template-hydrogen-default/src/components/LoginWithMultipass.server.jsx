import Multipassify from 'multipassify';
import {useShopQuery, NoStore, useShop} from '@shopify/hydrogen';
import gql from 'graphql-tag';

export default function LoginWithMultipass({renderPage}) {
  // not very safe that multipassToken comes from useShop, need to restric it to server
  const {multipassSecret} = useShop();

  // Todo: get customer email from session
  const customerEmail = 'michelle.ys.chen@gmail.com';

  const multipassToken = encodeCustomerData(multipassSecret, customerEmail);

  console.log('multipassToken', multipassToken);

  const {data} = useShopQuery({
    query: QUERY,
    variables: {
      multipassToken,
    },
    cache: NoStore(),
  });

  // why wont you resolve??
  console.log('LoginWithMultipass', data);

  if (
    data &&
    data.customerAccessTokenCreateWithMultipass &&
    data.customerAccessTokenCreateWithMultipass.customerAccessToken !== null
  ) {
    // set customerAccessToken to cookie
    return renderPage(
      data.customerAccessTokenCreateWithMultipass.customerAccessToken,
    );
  } else {
    return renderPage();
  }
}

function encodeCustomerData(multipassSecret, customerEmail) {
  const multipassify = new Multipassify('SHOPIFY MULTIPASS SECRET');

  return multipassify.encode({
    email: customerEmail,
  });
}

const QUERY = gql`
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

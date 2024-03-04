import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { env } from "~/env";

export default function Auth(props: { redirect: string }) {
  const router = useRouter();

  useEffect(() => {
    // Check if there's a code in the URL
    const { code } = router.query;

    if (code) {
      // Send a request to your authentication server to exchange the code for a token
      // Assuming you have a function to handle this, like fetchToken(code)
      fetchToken(code)
        .then((token) => {
          // Save the token to your preferred storage (e.g., cookies, localStorage)
          localStorage.setItem('token', token);

          // Redirect the user to the desired page after successful login
          router.push('/dashboard');
        })
        .catch((error) => {
          // Handle error, e.g., show an error message
          console.error('Error fetching token:', error);
        });
    }
  }, [router.query]);
}

export const getServerSideProps = async () => {
  return {
    props: {
      redirect: `https://focus.teamleader.eu/oauth2/authorize?client_id=${env.TEAMLEADER_CLIENT_ID}&response_type=code&redirect_uri=${env.TEAMLEADER_REDIRECT_URL}`,
    },
  };
};

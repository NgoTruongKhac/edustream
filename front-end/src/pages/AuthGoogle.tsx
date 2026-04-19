import { useEffect } from "react";
import { useSearchParams } from "react-router";
import Cookies from "js-cookie";

export default function AuthGoogle() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    try {
      const accessToken = searchParams.get("accessToken");
      console.log(accessToken);

      Cookies.set("accessToken", accessToken!);

      window.location.replace("/");
    } catch (error) {
      console.log(error);
    }
  });

  return <div>AuthGoogle</div>;
}

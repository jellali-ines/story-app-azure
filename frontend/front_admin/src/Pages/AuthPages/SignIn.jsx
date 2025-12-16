import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../Ccomponents/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}

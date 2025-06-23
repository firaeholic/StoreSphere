import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function createConnectedAccount(email: string, country = "US") {
  try {
    const account = await stripe.accounts.create({
      type: "standard",
      country,
      email,
    })

    return account
  } catch (error) {
    console.error("Error creating Stripe account:", error)
    throw error
  }
}

export async function createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: "account_onboarding",
    })

    return accountLink
  } catch (error) {
    console.error("Error creating account link:", error)
    throw error
  }
}

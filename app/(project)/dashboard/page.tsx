import { auth } from "@/app/lib/auth"

const Dashboard = async () => {
  // Estamos no lado do servidor
  const session = await auth()

  console.log(session)

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Protected Dashboard</h1>
    </div>
  )
}

export default Dashboard

import { httpRouter } from 'convex/server'
import { auth } from './auth'

// Convex Auth serves its token and JWKS endpoints from here.
const http = httpRouter()
auth.addHttpRoutes(http)

export default http

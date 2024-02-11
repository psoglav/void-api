import { Hono } from 'hono'
import Task from './task'
import List from './list'

const app = new Hono()

app.route('/task', Task)
app.route('/list', List)

app.get('/', (c) => c.text('version: 1.0'))

export default app
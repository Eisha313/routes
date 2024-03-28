import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
const port=3001;
const app = express();
app.use(cors())
mongoose.connect('mongodb://localhost:27017/myDatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
  
  
  
const userSchema = new mongoose.Schema({
  email: String,
  zipCode: String,
  routes: [String],
});
  
  const User = mongoose.model('User', userSchema);
  
  app.use(express.json());
  
 
//   app.post('/api/user', async (req, res) => {
//     try {
//         const { email, zipCode, routes } = req.body;
//         let user = await User.findOne({ email });

//         if (!user) {
//             // If the user doesn't exist, create a new one
//             user = new User({ email, zipCode, routes });
//         } else {
//             // If the user exists, update the information
//             user.zipCode = zipCode;
//             user.routes = routes;
//         }

//         await user.save();
//         res.status(201).json({ message: 'Zip codes saved.' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });
app.post('/api/user', async (req, res) => {
    try {
        const { email, zipCode, routes } = req.body;
        let user = await User.findOne({ email });

        if (!user) {
            // If the user doesn't exist, create a new one
            user = new User({ email, zipCode, routes });
            await user.save();
            res.status(201).json({ message: 'Zip codes saved.' });
        } else {
            // If the user exists, check for duplicate routes
            const uniqueRoutes = routes.filter(route => !user.routes.includes(route));

            if (uniqueRoutes.length > 0) {
                // Only update if there are new routes
                user.zipCode = zipCode;
                user.routes = [...user.routes, ...uniqueRoutes];
                await user.save();
                res.status(201).json({ message: 'Zip codes saved.' });
            } else {
                res.status(200).json({ message: 'Routes already saved.' });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

  
app.get('/api/user/:email', async (req, res) => {
    try {
      const email = req.params.email;
      const user = await User.findOne({ email });
  
      if (user) {
        // Retrieve only the last 15 routes
        const last15Routes = user.routes.slice(Math.max(user.routes.length - 15, 0));
  
        // Ensure routes are consistently formatted before sending them
        const formattedRoutes = last15Routes.map(route => {
          const [startZip, endZip] = route.split('-');
          return `${startZip}-${endZip}`;
        });
  
        // Send the user object with formatted routes
        res.status(200).json({
          email: user.email,
          zipCode: user.zipCode,
          routes: formattedRoutes,
        });
      } else {
        res.status(404).json({ error: 'User not found.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  }); 
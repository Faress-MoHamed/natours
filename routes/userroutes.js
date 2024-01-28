const express = require('express');
const authcontroller = require('./../controllers/authController');
const usercontroller = require('./../controllers/usercontroller');
const router = express.Router();

router.post('/signUp', authcontroller.signUp);
router.post('/login', authcontroller.signIn);
router.post('/forgetpassword', authcontroller.forgetPassword);
router.patch('/resetpassword/:token', authcontroller.resetpassword);

//you must sign up firstly to
router.route('/').get(usercontroller.getAllusers);
router.use(authcontroller.protect);

router.delete('/deleteMe', usercontroller.deleteMe);
router.patch('/updateMe', usercontroller.UpdateMe);
router.get('/getMe', usercontroller.getMe, usercontroller.getuser);
router.patch('/updateMypassword', authcontroller.updateMyPassword);
//not any user can GET PATCH DELETE users

router.use(authcontroller.restrictTo('admin'));

router
  .route('/:id')
  .get(usercontroller.getuser)
  .delete(usercontroller.deleteuser)
  .patch(usercontroller.updateuser);

module.exports = router;

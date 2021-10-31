var express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const conn = require('../config/config.json');

var connection = mysql.createConnection(conn);
connection.connect();

const session = require('express-session');
var flash = require('connect-flash'); 
var router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/pos_deli');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
router.use(cookieParser());
router.use(session({secret : '비밀코드', resave:true, saveUninitialized:false}));
router.use(passport.initialize());
router.use(passport.session());
router.use(flash());

passport.serializeUser(function (user, done) {
  console.log("serializeUser", user.id)
  done(null, user.id)
});

passport.deserializeUser(function (id, done) {
  console.log("deserializeUser id ", id);
  done(null, id);
}); 

passport.use('local-login', new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  passReqToCallback: true
}, function (req, id, pw, done) {
  var sql = 'select * from pos_mem_delis where dcode =? and password=?';
  connection.query(sql, [id, pw], function (err, datas) {
    if (err) return done(err);
    if (datas.length) {
      return done(null, {
        id: id
      });
    } else {
      return done(null, false, {
        message: '아이디 혹은 비밀번호가 틀립니다.'
      })
    }
  })
}));
passport.use('local-join', new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  passReqToCallback: true
}, function (req, id, pw, done) {
  console.log('local-join');
  //https://dahanweb.tistory.com/87
}))

router.get('/join', function (req, res, next) {
  var msg;
  var errMsg = req.flash('error');
  if (errMsg) {
    msg = errMsg;
  }
  res.render('join', {
    title: 'join',
    message: msg
  });
});
router.get('/', function(req, res, next){
  var msg;
  var errMsg = req.flash('error');
  if (errMsg) {
    msg = errMsg;
  }
  res.render('login', {title:'login', message:msg})
});
router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/users/main',
  failureRedirect: '/users',
  failureFlash: true
}));
router.get('/main', function (req, res, next) {
  var id = req.user;
  res.render('index', {
    title: 'index',id
  });
});

router.get('/fail', function (req, res, next) {
  var msg;
  var errMsg = req.flash('error');
  if (errMsg) {
    msg = errMsg;
  }
  res.render('login', {
    title: 'fail',
    message: msg
  });
});

router.get('/my',loginconfirm, function (req, res, next) {
  res.render('index.ejs', {title: 'mypage'});
});

router.get('/logintest',loginconfirm, (req,res)=>{
  res.render('index.ejs', { title: '로그인되었습니다' });
})

function loginconfirm(req,res,next){
  if(req.user){
    next()
  }else{
    res.send('다시 로그인해주세요')
  }
}

router.get('/main', function (req, res, next) {
  var id = req.user;
  res.render('index', {
    title: 'index',
    id
  });
});
router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;

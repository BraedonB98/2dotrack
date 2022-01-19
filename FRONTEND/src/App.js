import React, {useState, useCallback} from 'react';
import { BrowserRouter as Router, Route , Routes, Navigate} from 'react-router-dom'; //also import Navigate for default routing

//------------------------Pages-------------------------------
import PageNotFound from './landing/pages/PageNotFound';
import HomePage from './landing/pages/HomePage';
import AuthPage from './users/pages/AuthPage';

//-----------------------Components--------------------------
import MainNavigation from './shared/components/Navigation/MainNavigation';

//----------------------Context--------------------------------
import { AuthContext } from './shared/context/auth-context';

const App = () => {
  const [isLoggedIn,setIsLoggedIn]=useState(false)
  const[UID,setUID]= useState(false);
  
  const login = useCallback((uid) => {
    console.log("logging in");
    setIsLoggedIn(true);
    setUID(uid);
  },[])
  const logout = useCallback(() => {
    console.log("logging out");
    setIsLoggedIn(false);
    setUID(null);
  },[])

  let routes;
  if (isLoggedIn){
    routes = ( //if user logged in
    <Routes>
      <Route path="/" exact element={<HomePage/>} />
      <Route path="/pagenotfound"  element = {<PageNotFound/>}/> {/* Need to make this the default if path is not found, looked at navigate but havnt been able to figure out*/}
    </Routes>
    );
  }
 else { //if user not logged in
    routes = (
    <Routes>
      <Route path="/" exact element={<HomePage/>} />
      <Route path="/auth" exact element={<AuthPage/>} />
      <Route path="/pagenotfound"  element = {<PageNotFound/>}/> {/* Need to make this the default if path is not found, looked at navigate but havnt been able to figure out*/}
    </Routes>
    );
 }
  
  return (
    <AuthContext.Provider 
    value = {{
      isLoggedIn,
      UID,
      login,
      logout}}
    >
    <Router>
      <MainNavigation/>
      <main>
        {routes}  
      </main>  
    </Router>
    </AuthContext.Provider>
  );
};

export default App;

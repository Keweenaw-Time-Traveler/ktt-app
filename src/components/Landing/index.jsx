//React
import React, { useEffect, useState } from 'react';
//Styles
import './styles.scss';
//Components
import Intro from './Intro';
import Options from './Options';

function Landing(props) {
  const [showIntro, setShowIntro] = useState(false);
  const [removeIntro, setRemoveIntro] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [removeSearch, setRemoveSearch] = useState(true);
  //Show takes care of the opacity so fades in
  const [showClass, setShowClass] = useState('show');
  //Visible takes care of moving off screen so does not cover components below
  const [visibleClass, setVisibleClass] = useState('visible');

  useEffect(() => {
    const { show } = props;
    if (show) {
      setShowClass('show');
      setVisibleClass('visible');
    } else {
      setShowClass('hide');
      //Delay is here to allow time to fade out before moving off screen
      setTimeout(() => {
        setVisibleClass('invisible');
      }, 500);
    }
  });
  useEffect(() => {
    //This will fade in Intro using CSS
    setShowIntro(true);
    setTimeout(() => {
      //This will fade out Intro using CSS
      setShowIntro(false);
      //This will remove the Intro component after it fades out
      setTimeout(() => {
        setRemoveIntro(true);
        //This will fade in Search with CSS
        setRemoveSearch(false);
        setTimeout(() => setShowSearch(true), 400);
      }, 850);
    }, 3000);
  }, []);

  return (
    <div className={`landing ${showClass} ${visibleClass}`}>
      {removeIntro ? null : <Intro show={showIntro} />}
      {removeSearch ? null : <Options show={showSearch} />}
    </div>
  );
}

export default Landing;

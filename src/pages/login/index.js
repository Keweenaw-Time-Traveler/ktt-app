import React, { Component } from 'react';
import styles from './login.module.css'; // Import css modules stylesheet as styles

export class login extends Component {
  render() {
    return (
      <div>
        <h1>Login</h1>
        <p className={styles.text}>
          Lorem ipsum dolor sit amet, melius torquatos an eos. Commodo adipisci
          ad ius. Has delectus insolens disputando eu, aeque elitr sed at, eos
          ei legere eleifend. Eos ei hinc vide, his elit erant at, at ius magna
          utroque recteque.
        </p>
      </div>
    );
  }
}

export default login;

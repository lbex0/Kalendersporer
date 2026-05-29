namespace kalendersporer;

using { kalendersporer.Ansatt } from './Ansatt';

entity LoginInfo 
{
  key id : Integer;
  ansatt : Association to Ansatt;
  username : String;
  password_hash : String;
  created_at : Timestamp;
  updated_at : Timestamp;
}


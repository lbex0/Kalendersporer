namespace kalendersporer;

using { kalendersporer.Ansatt } from './Ansatt';

entity Fraværssøknad 
{
  key id : Integer;
  ansatt : Association to Ansatt;
  fraværstype : String;
  fra_dato : Date;
  til_dato : Date;
  status : String;
}

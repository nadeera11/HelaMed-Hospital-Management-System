const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Appointment = require('./Model/AppointmentModel');
const User = require('./Model/UserModel');
const Staff = require('./Model/StaffModel');
const Department = require('./Model/DepartmentModel');

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('Connected to MongoDB');
    console.log('\n=== Checking Appointments ===\n');
    
    const appointments = await Appointment.find({});
    
    console.log(`Total appointments: ${appointments.length}\n`);
    
    let orphanedCount = 0;
    const orphanedAppointments = [];
    
    for (const apt of appointments) {
      // Check if patient exists
      const patientExists = await User.findById(apt.patient);
      
      if (!patientExists) {
        orphanedCount++;
        console.log(`❌ Orphaned Appointment ID: ${apt._id}`);
        console.log(`   - Date: ${apt.appointmentDate}`);
        console.log(`   - Time: ${apt.appointmentTime}`);
        console.log(`   - Status: ${apt.status}`);
        console.log(`   - Patient ID in DB: ${apt.patient}`);
        console.log(`   - Doctor ID: ${apt.doctor}`);
        console.log('');
        
        orphanedAppointments.push(apt._id);
      } else {
        console.log(`✅ Valid Appointment ID: ${apt._id}`);
        console.log(`   - Patient: ${patientExists.name}`);
        console.log(`   - Date: ${apt.appointmentDate}`);
        console.log('');
      }
    }
    
    console.log('\n=== Summary ===');
    console.log(`Total appointments: ${appointments.length}`);
    console.log(`Valid appointments: ${appointments.length - orphanedCount}`);
    console.log(`Orphaned appointments: ${orphanedCount}`);
    
    if (orphanedCount > 0) {
      console.log('\n⚠️  Found orphaned appointments (appointments with deleted/missing patients)');
      console.log('Do you want to delete these orphaned appointments? (Run with --delete flag)');
      
      if (process.argv.includes('--delete')) {
        console.log('\n🗑️  Deleting orphaned appointments...');
        const result = await Appointment.deleteMany({ _id: { $in: orphanedAppointments } });
        console.log(`✅ Deleted ${result.deletedCount} orphaned appointments`);
      }
    }
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
  });

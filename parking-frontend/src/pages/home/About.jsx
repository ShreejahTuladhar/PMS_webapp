const About = () => {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-3xl font-semibold mb-4">About ParkSmart</h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        ParkSmart is a smart parking management system designed to simplify
        parking for users and streamline operations for parking space providers.
      </p>
      <ul className="list-disc pl-6 text-gray-600">
        <li>Search and reserve parking spots in real time</li>
        <li>Register your parking location and manage bookings</li>
        <li>
          Secure authentication and dashboard views for users, admins, and
          superadmins
        </li>
      </ul>
    </div>
  );
};

export default About;

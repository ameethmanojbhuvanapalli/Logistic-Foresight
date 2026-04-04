import NavigationBar from "../components/NavigationBar";
import {
  TrendingUpDown,
  Group,
  Waypoints,
  Activity,
  Shuffle,
  Linkedin,
  Github
} from "lucide-react";

import AmeethPhoto from "../assets/people/ameeth-portrait.png";
import VinyasPhoto from "../assets/people/vinyas-portrait.jpg";
import VivekPhoto from "../assets/people/vivek-portrait.png";
import YasirPhoto from "../assets/people/yasir-portrait.jpg";
import HODPhoto from "../assets/people/HOD-CSE.jpg";

import ReactLogo from '../assets/logos/react-logo.svg';
import FlaskLogo from '../assets/logos/Flask-logo.svg';
import SpringBootLogo from '../assets/logos/spring-boot-logo.png';
import KafkaLogo from '../assets/logos/Apache-kafka-logo.svg';
import MongoDBLogo from '../assets/logos/MongoDB_logo.svg';
import SQLServerLogo from '../assets/logos/Microsoft-SQL-Server-logo.svg';
import DockerLogo from '../assets/logos/Docker-logo.svg';


const About = () => {
  return (
    <div>
      {/* Navigation bar */}
      <NavigationBar />

      <div className="flex flex-col space-y-6 py-12 px-14 ml-10 font-poppins">
        <h2 className="text-4xl font-bold text-center text-[#ff8c8c]">About</h2>
        {/* About the Software */}
        <div>
          <p className="p-4 bg-gray-50 rounded-sm text-lg text-justify">
            Logistic Foresight is an innovative solution that aims to optimize
            real-time order fulfillment and delivery processes. By predicting
            the number of counters needed for efficient order processing, our
            software utilizes dynamic counter management and allocation to adapt
            to changing demands. We leverage historical data to forecast order
            volumes, which, combined with route optimization through clustering,
            helps businesses operate more efficiently. This ensures timely
            deliveries and enhances customer satisfaction. As we continue to
            develop the prototype, our goal is to improve delivery precision and
            streamline order fulfillment operations even further.
          </p>
        </div>
        <p className="text-2xl font-semibold text-[#ff8c8c]">Key Features: </p>
        {/* Container for feature boxes with decreased width */}
        <div className="p-3 rounded-sm text-lg text-justify flex flex-row justify-around">
          <div className="bg-gray-50 p-3 hover:shadow-xl border text-center flex flex-col items-center w-56">
            <p className="mb-2">Realtime Counter Predictions</p>
            <Activity className="h-12 w-12" />
          </div>
          <div className="bg-gray-50 p-3 hover:shadow-xl border text-center flex flex-col items-center w-56">
            <p className="mb-2">Dynamic Counter Allocation</p>
            <Shuffle className="h-12 w-12" />
          </div>
          <div className="bg-gray-50 p-3 hover:shadow-xl border text-center flex flex-col items-center w-56">
            <p className="mb-2">Realtime order forecasts</p>
            <TrendingUpDown className="h-12 w-12" />
          </div>
          <div className="bg-gray-50 p-3 hover:shadow-xl border text-center flex flex-col items-center w-56">
            <p className="mb-2">Clustered delivery locations</p>
            <Group className="h-12 w-12" />
          </div>
          <div className="bg-gray-50 p-3 hover:shadow-xl border text-center flex flex-col items-center w-56">
            <p className="mb-2">Optimized route planning</p>
            <Waypoints className="h-12 w-12" />
          </div>
        </div>

        <h3 className="text-2xl font-semibold text-center text-[#ff8c8c]">Our Vision</h3>
        <section className="mt-8 p-6 bg-gray-50 rounded-sm">
          <p className="mt-4 text-lg text-justify">
            Our vision is to revolutionize logistics by utilizing predictive technologies and efficient resource management to drive faster, more accurate deliveries. We aim to empower businesses to anticipate and adapt to customer needs, fostering a seamless logistics experience that benefits companies and their customers alike.
          </p>
        </section>


        <p className="text-2xl font-semibold text-[#ff8c8c]">Guide: </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Mentor Profile */}
          <div className="bg-white rounded-xl border border-slate-300/70 px-2 py-6 text-center transition duration-300 ease-in-out hover:border-slate-300/30 hover:shadow-lg md:col-span-1">
            <img
              src={HODPhoto}
              className="mx-auto w-40 h-40 rounded-full object-cover xl:h-44 xl:w-44"
              alt="Mentor"
            />
            <div className="mt-1 leading-6">
              <h3 className="text-xl font-medium text-[#ee6666]">Dr. Jyothi Shetty</h3>
              <p className="mt-1 text-base font-semibold">Professor & Head</p>
              <p className="mt-1 text-base">Department of CSE</p>
              <p className="mt-1 text-base">NMAMIT, Nitte</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 flex flex-col justify-center text-lg text-justify border border-slate-300/70 hover:shadow-lg md:col-span-2">
          <h4 className="text-xl font-semibold text-[#ff8c8c]">Mentorship Overview</h4>
          <p className="mt-4">
            Dr. Jyothi Shetty has been a guiding force for countless students in the Computer Science and Engineering department at NMAMIT, Nitte. With extensive experience in academia, she emphasizes the importance of hands-on learning and critical thinking. 
            Her mentorship philosophy centers around empowering students to develop their unique strengths and pursue their passions.

            Dr. Shetty's dedication is evident in her personalized approach to mentorship, taking the time to understand each student’s goals and challenges. She is known for her insightful feedback, encouraging words, and unwavering support. 
          </p>
        </div>
        </div>

        {/* Credits */}
        <p className="text-2xl font-semibold text-[#ff8c8c]">Team members: </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mt-6">
          <div className="bg-white rounded-xl border border-slate-300/70  py-6 text-center transition duration-300 ease-in-out hover:border-slate-300/30 hover:shadow-lg">
            <img
              src={AmeethPhoto}
              className="mx-auto w-40 h-40 rounded-full object-cover xl:h-44 xl:w-44"
            />
            <div className="mt-1 leading-6">
              <h3 className="text-xl font-medium text-[#ee6666]">
                Ameeth Manoj Bhuvanapalli
              </h3>
              <p className="mt-1 text-base font-semibold">7th Sem CSE</p>
              <p className="mt-1 text-sm">ameethmanojbhuvanapalli@gmail.com</p>
              <ul className="mt-6 flex items-center justify-center space-x-4">
                <li className="hover:text-[#ff8c8c] transition-colors">
                  <a href="https://in.linkedin.com/in/manojba04#">
                    <Linkedin />
                  </a>{" "}
                </li>
                <li className="hover:text-[#ff8c8c] transition-colors">
                  <a href="https://github.com/ameethmanojbhuvanapalli">
                    <Github />
                  </a>{" "}
                </li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-300/70 px-2 py-6 text-center transition duration-300 ease-in-out hover:border-slate-300/30 hover:shadow-lg">
            <img
              src={VinyasPhoto}
              className="mx-auto w-40 h-40 rounded-full object-cover xl:h-44 xl:w-44"
            />
            <div className="mt-1 leading-6">
              <h3 className="text-xl font-medium text-[#ee6666]">
                Vinyas V Amin
              </h3>
              <p className="mt-1 text-base font-semibold">7th Sem CSE</p>
              <p className="mt-1 text-base">vinyasamin03@gmail.com</p>
              <ul className="mt-6 flex items-center justify-center space-x-4">
                <li className="hover:text-[#ff8c8c] transition-colors">
                  <a href="https://in.linkedin.com/in/vinyas-v-amin-32253b265">
                    <Linkedin />
                  </a>{" "}
                </li>
                <li className="hover:text-[#ff8c8c] transition-colors">
                  <a href="https://github.com/vinyas03">
                    <Github />
                  </a>{" "}
                </li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-300/70 px-2 py-6 text-center transition duration-300 ease-in-out hover:border-slate-300/30 hover:shadow-lg">
            <img
              src={VivekPhoto}
              className="mx-auto w-40 h-40 rounded-full object-cover xl:h-44 xl:w-44"
            />
            <div className="mt-1 leading-6">
              <h3 className="text-xl font-medium text-[#ee6666]">
                Vivek Kumar
              </h3>
              <p className="mt-1 text-base font-semibold">7th Sem CSE</p>
              <p className="mt-1 text-base">vkumar1972003@gmail.com</p>
              <ul className="mt-6 flex items-center justify-center space-x-4">
                <li className="hover:text-[#ff8c8c] transition-colors">
                  <a href="https://www.linkedin.com/in/vivek-kumar-35a3a6224">
                    <Linkedin />
                  </a>{" "}
                </li>
                <li className="hover:text-[#ff8c8c] transition-colors">
                  <a href="https://github.com/Vive007">
                    <Github />
                  </a>{" "}
                </li>
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-300/70 px-2 py-6 text-center transition duration-300 ease-in-out hover:border-slate-300/30 hover:shadow-lg">
            <img
              src={YasirPhoto}
              className="mx-auto w-40 h-40 rounded-full object-cover xl:h-44 xl:w-44"
            />
            <div className="mt-1 leading-6">
              <h3 className="text-xl font-medium text-[#ee6666]">
                Yasir Manzoor Sheikh
              </h3>
              <p className="mt-1 text-base font-semibold">7th Sem CSE</p>
              <p className="mt-1 text-base">yasirmanzoor6878@gmail.com</p>
              <ul className="mt-6 flex items-center justify-center space-x-4">
                <li className="hover:text-[#ff8c8c] transition-colors">
                  <a href="https://in.linkedin.com/in/yasir-manzoor-7a327123b">
                    <Linkedin />
                  </a>{" "}
                </li>
                <li className="hover:text-[#ff8c8c] transition-colors">
                  <a href="https://github.com/yasir6878">
                    <Github />
                  </a>{" "}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <p className="text-2xl font-semibold text-[#ff8c8c]">Tech Stack</p>
        <div className="flex justify-around items-center space-x-6 overflow-x-auto p-4 bg-gray-50 rounded-sm text-lg w-full">
          <div className="flex flex-col items-center space-y-2 min-w-[100px]">
            <img src={ReactLogo} alt="React" className="h-20 w-20 object-contain" />
            <p className="text-sm font-medium text-gray-600">React</p>
          </div>
          <div className="flex flex-col items-center space-y-2 min-w-[100px]">
            <img src={FlaskLogo} alt="Flask" className="h-20 w-20 object-contain" />
            <p className="text-sm font-medium text-gray-600">Flask</p>
          </div>
          <div className="flex flex-col items-center space-y-2 min-w-[100px]">
            <img src={SpringBootLogo} alt="Spring Boot" className="h-20 w-20 object-contain" />
            <p className="text-sm font-medium text-gray-600">Spring Boot</p>
          </div>
          <div className="flex flex-col items-center space-y-2 min-w-[100px]">
            <img src={KafkaLogo} alt="Kafka" className="h-20 w-20 object-contain" />
            <p className="text-sm font-medium text-gray-600">Kafka</p>
          </div>
          <div className="flex flex-col items-center space-y-2 min-w-[100px]">
            <img src={MongoDBLogo} alt="MongoDB" className="h-20 w-20 object-contain" />
            <p className="text-sm font-medium text-gray-600">MongoDB</p>
          </div>
          <div className="flex flex-col items-center space-y-2 min-w-[100px]">
            <img src={SQLServerLogo} alt="SQL Server" className="h-20 w-20 object-contain" />
            <p className="text-sm font-medium text-gray-600">SQL Server</p>
          </div>
          <div className="flex flex-col items-center space-y-2 min-w-[100px]">
            <img src={DockerLogo} alt="Docker" className="h-20 w-20 object-contain" />
            <p className="text-sm font-medium text-gray-600">Docker</p>
          </div>
        </div>

        <p className="text-2xl font-semibold text-[#ff8c8c]">Source Code</p>
        <div className="p-4 bg-gray-50 rounded-sm text-lg">
          <p>
            The source code for this project is open-source and available on GitHub. We
            welcome developers, students, and enthusiasts to explore, contribute, and collaborate 
            to help make this project better. Whether you want to report issues, suggest new 
            features, or improve existing functionality, your contribution can make a significant 
            impact.
          </p>
          <p className="mt-4">
            You can view and contribute to the project’s source code on GitHub:
          </p>
          <a 
            href="https://github.com/your-repository-link"
            className="text-[#ff8c8c] hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Repository Link
          </a>
        </div>

      </div>
    </div>
  );
};

export default About;

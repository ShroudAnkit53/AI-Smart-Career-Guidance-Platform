import { CheckCircle2 } from "lucide-react";
import AiImg from "../../assets/ai.jpg";
import { checklistItems } from "../../constants";

const Workflow = () => {
  return (
    <div id="workflow" className="mt-20">
      <div className="text-center">
        <span className="bg-neutral-900 text-orange-500 rounded-full h-6 text-lg font-medium px-2 py-1 uppercase">
          Workflow
        </span>
      <h2 className="text-3xl sm:text-5xl lg:text-6xl text-center mt-6 tracking-wide">
        How Our{" "}
        <span className="bg-gradient-to-r from-orange-500 to-orange-800 text-transparent bg-clip-text">
          AI Career Engine
        </span>{" "}
        Works
      </h2>
       <p className="text-center text-neutral-500 mt-6 max-w-3xl mx-auto">
        From skill analysis to interview prediction — our AI-driven system
        evaluates your profile, detects skill gaps, and guides you toward
        better career outcomes.
      </p>
      </div>
      <div className="flex flex-wrap justify-center items-center">
        <div className="p-2 w-full lg:w-1/2 flex justify-center">
          <img src={AiImg} alt="Coding" className="w-80 h-80 object-cover" />
        </div>
        <div className="pt-12 w-full lg:w-1/2">
          {checklistItems.map((item, index) => (
            <div key={index} className="flex mb-12">
              <div className="text-green-400 mx-6 bg-neutral-900 h-10 w-10 p-2 justify-center items-center rounded-full">
                <CheckCircle2 />
              </div>
              <div>
                <h5 className="mt-1 mb-2 text-xl">{item.title}</h5>
                <p className="text-md text-neutral-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Workflow;

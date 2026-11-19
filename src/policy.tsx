import "./styles";
import PolicyPage, { type PolicyId } from "@/pages/policy";
import { mount } from "@/lib/mount";

// One entry for all four policy pages; each HTML file says which it is.
const id = document.getElementById("root")!.dataset.page as PolicyId;

mount(<PolicyPage id={id} />);

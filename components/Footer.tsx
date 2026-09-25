import {FC} from "react";
import {Stack, Text, Link} from "@chakra-ui/react";

type Props = {
    [key: string]: any
};

const vercelSponsor = process.env["NEXT_PUBLIC_VERCEL_SPONSOR"] === "true";

const Footer: FC<Props> = (props) => (
    <Stack
        as="footer"
        w="full"
        p={3}
        fontSize={["sm", null, "md"]}
        direction={["column", null, "row"]}
        justify="center"
        align="center"
        spacing={[1, null, 2]}
        {...props}
    >
        <div id="cookie-accept" style={{position: "absolute", background: '#e3fbe3', padding: '10px', bottom: "30px"}}>
            This site use cookie for adds. Use the Accept button to consent. Leave site to decline.
            Using site without click Accept also mean that you consent for using cookies.
            <button style={{background: '#90ee90', padding: '3px', marginLeft: '5px'}} onClick={() => {
                window.localStorage.setItem("cookie-accept", "true");
                document!.getElementById("cookie-accept")!.style.display = "none";
            }}>Accept</button>
        </div>
        <script
            dangerouslySetInnerHTML={{
                __html: `
                    if (localStorage.getItem("cookie-accept")) {
                        document.getElementById("cookie-accept").style.display = "none"; 
                    }
                `
            }}
        ></script>

        <Link href="https://github.com/thedaviddelta/lingva-translate/blob/main/LICENSE" isExternal={true}>
            <Text as="span">&#169; 2021 thedaviddelta & contributors</Text>
        </Link>
        <Text as="span" display={["none", null, "unset"]}>·</Text>
        <Link href="https://www.gnu.org/licenses/agpl-3.0.html" isExternal={true}>
            <Text as="span">Licensed under AGPLv3</Text>
        </Link>
        {vercelSponsor && (
            <>
                <Text as="span" display={["none", null, "unset"]}>·</Text>
                <Link href="https://vercel.com?utm_source=lingva-team&utm_campaign=oss" isExternal={true}>
                    <Text as="span">▲ Powered by Vercel</Text>
                </Link>
            </>
        )}
    </Stack>
);

export default Footer;

import { useEffect } from 'react';
import {
	ExclamationCircleIcon,
	XIcon,
	ExclamationIcon,
	CheckCircleIcon,
	InformationCircleIcon,
} from '@heroicons/react/outline';

export enum AlertTypes {
	INFO = 'info',
	SUCCESS = 'success',
	WARNING = 'warning',
	ERROR = 'error',
}

interface AlertProps {
	type: AlertTypes;
	message: string;
	duration: number;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const iconStyling = 'stroke-current flex-shrink-0 h-6 w-6';
const AlertOptions: Record<
	AlertTypes,
	{ name: string; alert: string; hover: string; icon: JSX.Element }
> = {
	[AlertTypes.INFO]: {
		name: 'info',
		alert: 'alert-info',
		hover: 'hover:bg-info-content',
		icon: <ExclamationCircleIcon className={iconStyling} />,
	},
	[AlertTypes.SUCCESS]: {
		name: 'success',
		alert: 'alert-success',
		hover: 'hover:bg-success-content',
		icon: <InformationCircleIcon className={iconStyling} />,
	},
	[AlertTypes.WARNING]: {
		name: 'warning',
		alert: 'alert-warning',
		hover: 'hover:bg-warning-content',
		icon: <ExclamationIcon className={iconStyling} />,
	},
	[AlertTypes.ERROR]: {
		name: 'error',
		alert: 'alert-error',
		hover: 'hover:bg-error-content',
		icon: <ExclamationCircleIcon className={iconStyling} />,
	},
};

const Alert = ({ type, message, duration, open, setOpen }: AlertProps) => {
	useEffect(() => {
		setTimeout(() => {
			setOpen(false);
		}, duration);
	}, [open]);

	return (
		<div
			className={`alert ${
				AlertOptions[type].alert
			} shadow-lg fixed bottom-5 left-5 right-auto flex w-auto transition-all duration-300 ${
				open ? 'opacity-100' : 'opacity-0'
			}`}
		>
			<div>
				{AlertOptions[type].icon}
				<span>{message}</span>
			</div>
			<div>
				<XIcon
					className={`stroke-current flex-shrink-0 h-6 w-6 ${AlertOptions[type].hover} hover:text-white rounded-full p-1 cursor-pointer transition-colors`}
					onClick={() => setOpen(false)}
				/>
			</div>
		</div>
	);
};
export default Alert;

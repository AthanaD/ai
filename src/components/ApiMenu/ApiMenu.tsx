import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import useStore from '@store/store';
import useHideOnOutsideClick from '@hooks/useHideOnOutsideClick';
import PopupModal from '@components/PopupModal';
import { availableEndpoints, defaultAPIEndpoint } from '@constants/auth';
import DownChevronArrow from '@icon/DownChevronArrow';

const ApiMenu = ({ setIsModalOpen }: { setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>; }) => {
  const { t } = useTranslation(['main', 'api']);

  const setApiKey = useStore((state) => state.setApiKey);
  const setApiEndpoint = useStore((state) => state.setApiEndpoint);

  const [_apiEndpoint, _setApiEndpoint] = useState<string>(defaultAPIEndpoint);
  const [_apiKey, _setApiKey] = useState<string>('');
  const [_customEndpoint, _setCustomEndpoint] = useState<boolean>(false);

  const handleSave = () => {
    setApiKey(_apiKey);
    setApiEndpoint(_apiEndpoint);
    setIsModalOpen(false);
  };

  const handleToggleCustomEndpoint = () => {
    if (_customEndpoint) {
      _setApiEndpoint(defaultAPIEndpoint);
      _setApiKey(import.meta.env.VITE_DEFAULT_API_KEY);
    } else {
      _setApiEndpoint('');
      _setApiKey('');
    }
    _setCustomEndpoint(prev => !prev);
  };

  const handleApiEndpointChange = (newEndpoint: string) => {
    _setApiEndpoint(newEndpoint);
    if (newEndpoint === import.meta.env.VITE_OFFICIAL_API_ENDPOINT) {
      _setApiKey(import.meta.env.VITE_OFFICIAL_API_KEY);
    } else if (newEndpoint === import.meta.env.VITE_CUSTOM_API_ENDPOINT) {
      _setApiKey(import.meta.env.VITE_CUSTOM_API_KEY);
    } else {
      _setApiKey('');
    }
  };

  const preventCopy = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    alert("Copying API key is not allowed.");
  };

  return (
    <PopupModal
      title={t('api') as string}
      setIsModalOpen={setIsModalOpen}
      handleConfirm={handleSave}
    >
      <div className='p-6 border-b border-gray-200 dark:border-gray-600'>
        <label className='flex gap-2 text-gray-900 dark:text-gray-300 text-sm items-center mb-4'>
          <input
            type='checkbox'
            checked={_customEndpoint}
            className='w-4 h-4'
            onChange={handleToggleCustomEndpoint}
          />
          {t('customEndpoint', { ns: 'api' })}
        </label>

        <div className='flex gap-2 items-center mb-6'>
          <div className='min-w-fit text-gray-900 dark:text-gray-300 text-sm'>
            {t('apiEndpoint.inputLabel', { ns: 'api' })}
          </div>
          {_customEndpoint ? (
            <input
              type='password'
              className='text-gray-800 dark:text-white p-3 text-sm border-none bg-gray-200 dark:bg-gray-600 rounded-md m-0 w-full mr-0 h-8 focus:outline-none'
              value={_apiEndpoint}
              onChange={(e) => handleApiEndpointChange(e.target.value)}
            />
          ) : (
            <ApiEndpointSelector
              _apiEndpoint={_apiEndpoint}
              handleApiEndpointChange={handleApiEndpointChange}
            />
          )}
        </div>

        <div className='flex gap-2 items-center justify-center mt-2'>
          <div className='min-w-fit text-gray-900 dark:text-gray-300 text-sm'>
            {t('apiKey.inputLabel', { ns: 'api' })}
          </div>
          <input
            type='password'
            className='text-gray-800 dark:text-white p-3 text-sm border-none bg-gray-200 dark:bg-gray-600 rounded-md m-0 w-full mr-0 h-8 focus:outline-none'
            value={_apiKey}
            onChange={(e) => _setApiKey(e.target.value)}
            onCopy={preventCopy}
          />
        </div>

        <div className='min-w-fit text-gray-900 dark:text-gray-300 text-sm flex flex-col gap-3 leading-relaxed'>
          <p className='mt-4'>
            <Trans
              i18nKey='apiKey.howTo'
              ns='api'
              components={[
                <a
                  href='https://platform.openai.com/account/api-keys'
                  className='link'
                  target='_blank'
                  rel='noopener noreferrer'
                />,
              ]}
            />
          </p>
          <p>{t('securityMessage', { ns: 'api' })}</p>
          <p>{t('apiEndpoint.description', { ns: 'api' })}</p>
          <p>{t('apiEndpoint.warn', { ns: 'api' })}</p>
        </div>
      </div>
    </PopupModal>
  );
};

const ApiEndpointSelector = ({
  _apiEndpoint,
  handleApiEndpointChange,
}: {
  _apiEndpoint: string;
  handleApiEndpointChange: (endpoint: string) => void;
}) => {
  const [dropDown, setDropDown, dropDownRef] = useHideOnOutsideClick();

  return (
    <div className='w-[40vw] relative flex-1'>
      <button
        className='btn btn-neutral btn-small flex justify-between w-full'
        type='button'
        aria-label='expand api menu'
        onClick={() => setDropDown(prev => !prev)}
      >
        <span className='truncate'>{_apiEndpoint}</span>
        <DownChevronArrow />
      </button>
      <div
        id='dropdown'
        ref={dropDownRef}
        className={`${dropDown ? '' : 'hidden'} absolute top-100 bottom-100 z-10 bg-white rounded-lg shadow-xl border-b border-black/10 dark:border-gray-900/50 text-gray-800 dark:text-gray-100 group dark:bg-gray-800 opacity-90 w-32 w-full`}
      >
        <ul
          className='text-sm text-gray-700 dark:text-gray-200 p-0 m-0'
          aria-labelledby='dropdownDefaultButton'
        >
          {availableEndpoints.map(endpoint => (
            <li
              className='px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer truncate'
              onClick={() => {
                handleApiEndpointChange(endpoint);
                setDropDown(false);
              }}
              key={endpoint}
            >
              {endpoint}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ApiMenu;

                 

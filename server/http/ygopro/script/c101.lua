--Star Wolf
function c101.initial_effect(c)
	--lv change
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCountLimit(1,101)
	e1:SetTarget(c101.target)
	e1:SetOperation(c101.operation)
	c:RegisterEffect(e1)
end

function c101.filter(c)
	return c:IsFaceup() and c:GetLevel()>0 and c:IsRace(RACE_BEAST)
end
function c101.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(tp) and c101.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c101.filter,tp,LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	local g=Duel.SelectTarget(tp,c101.filter,tp,LOCATION_MZONE,0,1,2,nil)
	local t={}
	local p=1
	local lv1=g:GetFirst():GetLevel()
	local lv2=0
	local tc2=g:GetNext()
	if tc2 then lv2=tc2:GetLevel() end
	for i=1,8 do
		if lv1~=i and lv2~=i then t[p]=i p=p+1 end
	end
	Duel.Hint(HINT_SELECTMSG,tp,567)
	local lv=Duel.AnnounceNumber(tp,table.unpack(t))
	e:SetLabel(lv)
end
function c101.lvfilter(c,e)
	return c:IsFaceup() and c:IsRelateToEffect(e)
end
function c101.operation(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS):Filter(c101.lvfilter,nil,e)
	local tc=g:GetFirst()
	while tc do
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_CHANGE_LEVEL)
		e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e1:SetValue(e:GetLabel())
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
		tc:RegisterEffect(e1)
		local e3=Effect.CreateEffect(e:GetHandler())
		e3:SetType(EFFECT_TYPE_SINGLE)
		e3:SetCode(EFFECT_CANNOT_BE_SYNCHRO_MATERIAL)		
		e3:SetProperty(EFFECT_FLAG_UNCOPYABLE)
		e3:SetValue(1)
		e3:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
		tc:RegisterEffect(e3)
		tc=g:GetNext()
	end
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetTargetRange(1,0)
	e1:SetTarget(c101.splimit)
	e1:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e1,tp)
	
end
function c101.splimit(e,c)
	return c:GetRace()~=RACE_BEAST
end

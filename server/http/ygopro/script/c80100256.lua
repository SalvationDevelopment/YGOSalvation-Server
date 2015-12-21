--ガトムズの非常召集
function c80100256.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(0,TIMING_END_PHASE)
	e1:SetCountLimit(1,80100256+EFFECT_COUNT_CODE_OATH)
	e1:SetCost(c80100256.cost)
	e1:SetCondition(c80100256.condition)
	e1:SetTarget(c80100256.target)
	e1:SetOperation(c80100256.activate)
	c:RegisterEffect(e1)
end
function c80100256.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetCurrentPhase()~=PHASE_MAIN2 end
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CANNOT_BP)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_OATH)
	e1:SetTargetRange(1,0)
	e1:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e1,tp)
end
function c80100256.cfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x100d) and c:IsType(TYPE_SYNCHRO)
end
function c80100256.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c80100256.cfilter,tp,LOCATION_MZONE,0,1,nil)
end
function c80100256.filter(c,e,tp)
	return c:IsSetCard(0x100d) and c:IsCanBeSpecialSummoned(e,0,tp,true,false)
end
function c80100256.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:GetControler()==tp and chkc:GetLocation()==LOCATION_GRAVE and c80100256.filter(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>1
		and Duel.IsExistingTarget(c80100256.filter,tp,LOCATION_GRAVE,LOCATION_GRAVE,2,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c80100256.filter,tp,LOCATION_GRAVE,LOCATION_GRAVE,2,2,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,2,0,0)
end
function c80100256.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<2 then return end
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local sg=g:Filter(Card.IsRelateToEffect,nil,e)
	Duel.SpecialSummon(sg,0,tp,tp,true,false,POS_FACEUP)
	local tc=sg:GetFirst()
	while tc do
		Duel.SpecialSummonStep(tc,0,tp,tp,false,false,POS_FACEUP)
		local c=e:GetHandler()
		tc:RegisterFlagEffect(80100256,RESET_EVENT+0x1fe0000,0,1,fid)
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_DISABLE)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e1)
		local e2=Effect.CreateEffect(c)
		e2:SetType(EFFECT_TYPE_SINGLE)
		e2:SetCode(EFFECT_DISABLE_EFFECT)
		e2:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e2)
		local e3=Effect.CreateEffect(c)
		e3:SetType(EFFECT_TYPE_SINGLE)
		e3:SetCode(EFFECT_SET_ATTACK_FINAL)
		e3:SetValue(0)
		tc:RegisterEffect(e3)
		tc=sg:GetNext()
	end
	sg:KeepAlive()
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e4:SetCode(EVENT_PHASE+PHASE_END)
	e4:SetProperty(EFFECT_FLAG_IGNORE_IMMUNE)
	e4:SetCountLimit(1)
	e4:SetLabel(fid)
	e4:SetLabelObject(sg1)
	e4:SetCondition(c80100256.descon)
	e4:SetOperation(c80100256.desop)
	Duel.RegisterEffect(e4,tp)
end
function c80100256.desfilter(c,fid)
	return c:GetFlagEffectLabel(80100256)==fid
end
function c80100256.descon(e,tp,eg,ep,ev,re,r,rp)
	local g=e:GetLabelObject()
	if not g:IsExists(c80100256.desfilter,1,nil,e:GetLabel()) then
		g:DeleteGroup()
		e:Reset()
		return false
	else return true end
end
function c80100256.desop(e,tp,eg,ep,ev,re,r,rp)
	local g=e:GetLabelObject()
	local tg=g:Filter(c80100256.desfilter,nil,e:GetLabel())
	Duel.Destroy(tg,REASON_EFFECT)
end

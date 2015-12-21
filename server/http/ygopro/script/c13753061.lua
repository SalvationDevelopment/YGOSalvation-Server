--Psy-Frame Gear Alpha
function c13753061.initial_effect(c)
	c:SetStatus(STATUS_UNSUMMONABLE_CARD,true)
	--cannot pendulum summon
	local cp=Effect.CreateEffect(c)
	cp:SetType(EFFECT_TYPE_SINGLE)
	cp:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	cp:SetCode(EFFECT_SPSUMMON_CONDITION)
	cp:SetValue(c13753061.splimit)
	c:RegisterEffect(cp)
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(98437424,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e1:SetRange(LOCATION_HAND)
	e1:SetCode(EVENT_SUMMON_SUCCESS)
	e1:SetCondition(c13753061.spcon)
	e1:SetTarget(c13753061.sptg)
	e1:SetOperation(c13753061.spop)
	c:RegisterEffect(e1)
	local e2=e1:Clone()
	e2:SetCode(EVENT_SPSUMMON_SUCCESS)
	c:RegisterEffect(e2)
end
function c13753061.splimit(e,se,sp,st)
	return bit.band(st,SUMMON_TYPE_PENDULUM)~=SUMMON_TYPE_PENDULUM
end

function c13753061.spcon(e,tp,eg,ep,ev,re,r,rp)
	return rp~=tp and Duel.GetFieldGroupCount(tp,LOCATION_MZONE,0)<=0
end
function c13753061.filter(c,e,tp)
	return c:IsCode(13753060) and c:IsCanBeSpecialSummoned(e,0,tp,true,true)
end
function c13753061.filter2(c)
	return (c:IsCode(13753060) or c:IsCode(13753063)) and c:IsAbleToHand()
end
function c13753061.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>1
		and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) and
		Duel.IsExistingMatchingCard(c13753061.filter,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end
function c13753061.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=1 then return end
	local c=e:GetHandler()
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c13753061.filter,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE,0,1,1,nil,e,tp)
	local tc=g:GetFirst()
	if tc and Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP)~=0 and
		Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)~=0 then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		e1:SetRange(LOCATION_MZONE)
		e1:SetCode(EVENT_PHASE+PHASE_END)
		e1:SetOperation(c13753061.rmop)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,2)
		e1:SetCountLimit(1)
		c:RegisterEffect(e1)
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		e1:SetRange(LOCATION_MZONE)
		e1:SetCode(EVENT_PHASE+PHASE_END)
		e1:SetOperation(c13753061.rmop)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END,2)
		e1:SetCountLimit(1)
		tc:RegisterEffect(e1)
		
		local g2=Duel.SelectMatchingCard(tp,c13753061.filter2,tp,LOCATION_DECK,0,1,1,nil)
		if g2:GetCount()>0 then
			Duel.SendtoHand(g2,nil,REASON_EFFECT)
			Duel.ConfirmCards(1-tp,g2)
		end
	end
end
function c13753061.rmop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetTurnPlayer()~=tp then return false end
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_EFFECT)
end

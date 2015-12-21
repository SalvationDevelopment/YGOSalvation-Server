--PSYFrame gear Delta
function c6423.initial_effect(c)
	c:EnableUnsummonable()
	--cannot pendulum summon
	local e0=Effect.CreateEffect(c)
	e0:SetType(EFFECT_TYPE_SINGLE)
	e0:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e0:SetCode(EFFECT_SPSUMMON_CONDITION)
	e0:SetValue(c6423.splimit)
	c:RegisterEffect(e0)
	--Special Summon
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(6431,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON+CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCode(EVENT_CHAINING)
	e1:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DAMAGE_CAL)
	e1:SetRange(LOCATION_HAND)
	e1:SetCondition(c6423.condition)
	e1:SetTarget(c6423.target)
	e1:SetOperation(c6423.operation)
	c:RegisterEffect(e1)
end

function c6423.splimit(e,se,sp,st)
	return bit.band(st,SUMMON_TYPE_PENDULUM)~=SUMMON_TYPE_PENDULUM
end

function c6423.egfil(c,tp)
	return c:GetSummonPlayer()==tp
end
function c6423.condition(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	return rp~=tp and re:IsActiveType(TYPE_SPELL) and re:IsHasType(EFFECT_TYPE_ACTIVATE)
	and Duel.GetFieldGroupCount(e:GetHandler():GetControler(),LOCATION_MZONE,0,nil)==0
	and not c:IsStatus(STATUS_CHAINING)
end
function c6423.filter(c,e,tp)
	return c:IsCode(6428) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c6423.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>1 and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) and Duel.IsExistingMatchingCard(c6423.filter,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,2,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,eg,1,0,0)
end
function c6423.operation(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<2 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c6423.filter,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE,0,1,1,nil,e,tp)
	if g:GetCount()>0 then
		g:AddCard(e:GetHandler())
		Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
		local tc=g:GetFirst()
		while tc do
			Duel.SpecialSummonStep(tc,0,tp,tp,false,false,POS_FACEUP)
			tc:RegisterFlagEffect(6423,RESET_EVENT+0x1fe0000,0,1)
			local de=Effect.CreateEffect(e:GetHandler())
			de:SetDescription(aux.Stringid(6431,1))
			de:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
			de:SetCode(EVENT_PHASE+PHASE_END)
			de:SetCountLimit(1)
			de:SetProperty(EFFECT_FLAG_IGNORE_IMMUNE)
			de:SetLabelObject(tc)
			de:SetCondition(c6423.descon)
			de:SetOperation(c6423.desop)
			de:SetLabel(0)
			Duel.RegisterEffect(de,tp)
			tc=g:GetNext()
		end
		Duel.SpecialSummonComplete()
		Duel.NegateActivation(ev)
		if re:GetHandler():IsRelateToEffect(re) then
			Duel.Destroy(eg,REASON_EFFECT)
		end
	end
end

function c6423.descon(e,tp,eg,ep,ev,re,r,rp)
	local tc=e:GetLabelObject()
	return Duel.GetTurnCount()~=e:GetLabel() and tc:GetFlagEffect(6423)~=0
end
function c6423.desop(e,tp,eg,ep,ev,re,r,rp)
	local tc=e:GetLabelObject()
	Duel.Remove(tc,POS_FACEUP,REASON_EFFECT)
end

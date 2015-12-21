--PSYFrame Gear Beta
function c6421.initial_effect(c)
	c:EnableUnsummonable()
	--spsummon
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(6421,1))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON+CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e1:SetCode(EVENT_ATTACK_ANNOUNCE)
	e1:SetRange(LOCATION_HAND)
	e1:SetCondition(c6421.spcon)
	e1:SetTarget(c6421.sptg)
	e1:SetOperation(c6421.spop)
	c:RegisterEffect(e1)
	--splimit
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e2:SetCode(EFFECT_SPSUMMON_CONDITION)
	e2:SetValue(c6421.splimit)
	c:RegisterEffect(e2)
end
function c6421.splimit(e,se,sp,st)
	return bit.band(st,SUMMON_TYPE_PENDULUM)~=SUMMON_TYPE_PENDULUM
end
function c6421.filter(c,e,tp)
	return c:IsCode(6428) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c6421.spcon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetFieldGroupCount(e:GetHandler():GetControler(),LOCATION_MZONE,0,nil)==0
end
function c6421.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) and Duel.IsExistingMatchingCard(c6421.filter,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE,0,1,nil,e,tp) end
	local at=Duel.GetAttacker()
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,2,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,at,1,0,0)
end
function c6421.spop(e,tp,eg,ep,ev,re,r,rp)
	if not e:GetHandler():IsRelateToEffect(e) then return end
	local at=Duel.GetAttacker()
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<2 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c6421.filter,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE,0,1,1,nil,e,tp)
	if g:GetCount()>0 then
		g:AddCard(e:GetHandler())
	end
	if Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)~=0 then
		local tc=g:GetFirst()
		while tc do
			Duel.SpecialSummonStep(tc,0,tp,tp,false,false,POS_FACEUP)
			tc:RegisterFlagEffect(6421,RESET_EVENT+0x1fe0000,0,1)
			local de=Effect.CreateEffect(e:GetHandler())
			de:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
			de:SetCode(EVENT_PHASE+PHASE_END)
			de:SetCountLimit(1)
			de:SetProperty(EFFECT_FLAG_IGNORE_IMMUNE)
			de:SetLabelObject(tc)
			de:SetCondition(c6421.descon)
			de:SetOperation(c6421.desop)
			de:SetLabel(0)
			Duel.RegisterEffect(de,tp)
			tc=g:GetNext()
		end
		Duel.Destroy(at,REASON_EFFECT)
		Duel.SkipPhase(1-tp,PHASE_BATTLE,RESET_PHASE+PHASE_BATTLE,1)
	end
end
function c6421.descon(e,tp,eg,ep,ev,re,r,rp)
	local tc=e:GetLabelObject()
	return Duel.GetTurnCount()~=e:GetLabel() and tc:GetFlagEffect(6421)~=0
end
function c6421.desop(e,tp,eg,ep,ev,re,r,rp)
	local tc=e:GetLabelObject()
	Duel.Remove(tc,POS_FACEUP,REASON_EFFECT)
end
		
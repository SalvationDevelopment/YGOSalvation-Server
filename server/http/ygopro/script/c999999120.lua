--Castle of Dragon Souls
function c999999120.initial_effect(c)
	c:SetUniqueOnField(1,0,999999120)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(TIMING_DAMAGE_STEP)
	e1:SetTarget(c999999120.target1)
	e1:SetOperation(c999999120.activate)
	c:RegisterEffect(e1)
	--instant
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(999999120,1))
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetHintTiming(TIMING_DAMAGE_STEP)
	e2:SetLabel(1)
	e2:SetCost(c999999120.cost)
	e2:SetTarget(c999999120.target)
	e2:SetOperation(c999999120.activate)
	c:RegisterEffect(e2)
	--spsummmon
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(999999120,2))
	e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e3:SetType(EFFECT_TYPE_TRIGGER_O+EFFECT_TYPE_SINGLE)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetCode(EVENT_TO_GRAVE)
	e3:SetCondition(c999999120.spcon)
	e3:SetTarget(c999999120.sptg)
	e3:SetOperation(c999999120.spop)
	c:RegisterEffect(e3)
end
function c999999120.filter1(c)
	return c:IsRace(RACE_DRAGON) and c:IsAbleToRemoveAsCost()
end
function c999999120.filter2(c)
	return c:IsFaceup()
end

function c999999120.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c999999120.filter1,tp,LOCATION_GRAVE,0,1,nil) 
	end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectMatchingCard(tp,c999999120.filter1,tp,LOCATION_GRAVE,0,1,1,nil)
	Duel.Remove(g,POS_FACEUP,REASON_COST)
end

function c999999120.target1(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():GetFlagEffect(999999120)==0 end
	if 	Duel.IsExistingTarget(c999999120.filter2,tp,LOCATION_MZONE,0,1,nil)
	and Duel.IsExistingMatchingCard(c999999120.filter1,tp,LOCATION_GRAVE,0,1,nil) 
	and Duel.SelectYesNo(tp,aux.Stringid(999999120,0)) then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
		local g=Duel.SelectMatchingCard(tp,c999999120.filter1,tp,LOCATION_GRAVE,0,1,1,nil)
		Duel.Remove(g,POS_FACEUP,REASON_COST)
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
		Duel.SelectTarget(tp,c999999120.filter2,tp,LOCATION_MZONE,0,1,1,nil)
		e:SetCategory(CATEGORY_ATKCHANGE)
		e:SetLabel(1)
		e:GetHandler():RegisterFlagEffect(999999120,RESET_PHASE+PHASE_END,0,1)
	end
end
function c999999120.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(tp) and c999999120.filter2(chkc) end
	if chk==0 then return 	e:GetHandler():GetFlagEffect(999999120)==0 
							and Duel.IsExistingTarget(c999999120.filter2,tp,LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	Duel.SelectTarget(tp,c999999120.filter2,tp,LOCATION_MZONE,0,1,1,nil)
	e:GetHandler():RegisterFlagEffect(999999120,RESET_PHASE+PHASE_END,0,1)
end
function c999999120.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	local c=e:GetHandler()
	if e:GetLabel()~=1 or not c:IsRelateToEffect(e) then return end
	if tc:IsFaceup() and tc:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetValue(700)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		tc:RegisterEffect(e1)
	end
end
function c999999120.spcon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	return c:IsPreviousPosition(POS_FACEUP) and c:IsPreviousLocation(LOCATION_ONFIELD)
end
function c999999120.filter(c,e,tp)
	return c:IsRace(RACE_DRAGON) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c999999120.sptg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_REMOVED) and chkc:IsControler(tp) and c999999120.filter(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c999999120.filter,tp,LOCATION_REMOVED,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c999999120.filter,tp,LOCATION_REMOVED,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end
function c999999120.spop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
	end
end

--ゴーストリック・スペクター
function c80600017.initial_effect(c)
	--sumlimit
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CANNOT_SUMMON)
	e1:SetCondition(c80600017.sumcon)
	c:RegisterEffect(e1)
	--turn set
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_POSITION)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetTarget(c80600017.target)
	e2:SetOperation(c80600017.operation)
	c:RegisterEffect(e2)
	--spsummon
	local e4=Effect.CreateEffect(c)
	e4:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e4:SetProperty(EFFECT_FLAG_DAMAGE_STEP)
	e4:SetCode(EVENT_TO_GRAVE)
	e4:SetRange(LOCATION_HAND)
	e4:SetCondition(c80600017.spcon)
	e4:SetOperation(c80600017.spop)
	c:RegisterEffect(e4)
end
function c80600017.sumfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x91)
end
function c80600017.sumcon(e)
	return not Duel.IsExistingMatchingCard(c80600017.sumfilter,e:GetHandlerPlayer(),LOCATION_MZONE,0,1,nil)
end
function c80600017.target(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c:IsCanTurnSet() and c:GetFlagEffect(80600017)==0 end
	c:RegisterFlagEffect(80600017,RESET_EVENT+0x1fc0000+RESET_PHASE+PHASE_END,0,1)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,c,1,0,0)
end
function c80600017.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) and c:IsFaceup() then
		Duel.ChangePosition(c,POS_FACEDOWN_DEFENCE)
	end
end
function c80600017.spcon(e,tp,eg,ep,ev,re,r,rp)
	local tc=eg:GetFirst()
	local c=e:GetHandler()
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0 end
	while tc do
		if 	tc:IsReason(REASON_DESTROY) and tc:GetReasonPlayer()~=tp
			and tc:GetPreviousControler()==tp
			and tc:IsSetCard(0x91) and tc:IsType(TYPE_MONSTER) then
			return c:IsCanBeSpecialSummoned(e,0,tp,false,false)
		end
		tc=eg:GetNext()
	end
	return false
end
function c80600017.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.SpecialSummon(e:GetHandler(),0,tp,tp,false,false,POS_FACEDOWN_DEFENCE) then
		Duel.Draw(tp,1,REASON_EFFECT)
	end
end
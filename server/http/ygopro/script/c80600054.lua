--零鳥姫リオート・ハルピュイア
function c80600054.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunctionF(c,aux.FilterBoolFunction(Card.IsRace,RACE_ZOMBIE),5),2)
	c:EnableReviveLimit()
	--Special Summon
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80600054,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCondition(c80600054.condition)
	e1:SetCost(c80600054.cost)
	e1:SetTarget(c80600054.target)
	e1:SetOperation(c80600054.operation)
	c:RegisterEffect(e1)
	--
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e2:SetCode(EVENT_DESTROYED)
	e2:SetCondition(c80600054.regcon)
	e2:SetOperation(c80600054.regop)
	c:RegisterEffect(e2)
end
function c80600054.condition(e,tp,eg,ep,ev,re,r,rp)
	return  not Duel.CheckAttackActivity(tp)
end

function c80600054.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80600054)==0 and e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
	Duel.RegisterFlagEffect(tp,80600054,RESET_PHASE+PHASE_END,0,1)
end
function c80600054.filter(c,e)
	return c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80600054.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(1-tp) and c75162696.filter(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c80600054.filter,tp,0,LOCATION_GRAVE,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c80600054.filter,tp,0,LOCATION_GRAVE,1,1,nil,e,tp)
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CANNOT_ATTACK)
	e1:SetProperty(EFFECT_FLAG_OATH)
	e1:SetTargetRange(LOCATION_MZONE,0)
	e1:SetTarget(c80600054.ftarget)
	e1:SetLabelObject(g:GetFirst())
	e1:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e1,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end

function c80600054.ftarget(e,c)
	return e:GetLabelObject()~=c
end

function c80600054.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
	end
end

function c80600054.regcon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	return  c:IsPreviousLocation(LOCATION_ONFIELD) 
		and rp~=tp
		and c:GetPreviousControler()==tp
end

function c80600054.regop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80600054,1))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e1:SetRange(LOCATION_GRAVE)
	e1:SetCountLimit(1)
	e1:SetCode(EVENT_PHASE+PHASE_STANDBY)
	e1:SetTarget(c80600054.sptg)
	e1:SetOperation(c80600054.spop)
	e1:SetReset(RESET_EVENT+0x1fc0000+RESET_PHASE+PHASE_STANDBY)
	c:RegisterEffect(e1)
end

function c80600054.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local c=e:GetHandler()
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,c,1,0,0)
end

function c80600054.spop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) then
		Duel.SpecialSummon(c,1,tp,tp,false,false,POS_FACEUP_DEFENCE)
	end
end

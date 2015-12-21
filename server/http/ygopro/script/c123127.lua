--Red Eye Black Dragon Sword
function c123127.initial_effect(c)
	c:EnableReviveLimit()
	--spsummon condition
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	e1:SetValue(c123127.splimit)
	c:RegisterEffect(e1)
	--special summon rule
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetRange(LOCATION_EXTRA)
	e2:SetCondition(c123127.sprcon)
	e2:SetOperation(c123127.sprop)
	c:RegisterEffect(e2)
	--equip
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(123127,0))
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetCategory(CATEGORY_EQUIP)
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetRange(LOCATION_MZONE)
	e3:SetTarget(c123127.eqtg)
	e3:SetOperation(c123127.eqop)
	c:RegisterEffect(e3)
	--self destroy
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetCode(EFFECT_SELF_DESTROY)
	e4:SetCondition(c123127.sdcon)
	c:RegisterEffect(e4)
	--special summon
	local e5=Effect.CreateEffect(c)
	e5:SetDescription(aux.Stringid(123127,2))
	e5:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e5:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e5:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP)
	e5:SetCode(EVENT_TO_GRAVE)
	e5:SetCondition(c123127.spcon)
	e5:SetTarget(c123127.sptg)
	e5:SetOperation(c123127.spop)
	c:RegisterEffect(e5)
end
c123127.material_count=2
c123127.material={12394,74677422}
function c123127.splimit(e,se,sp,st)
	return e:GetHandler():GetLocation()~=LOCATION_EXTRA
end
function c123127.sprfilter(c,code)
	return c:IsCode(code) and c:IsAbleToGraveAsCost()
end
function c123127.sprcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.IsExistingMatchingCard(c123127.sprfilter,tp,LOCATION_ONFIELD,0,1,nil,12394)
		and Duel.IsExistingMatchingCard(c123127.sprfilter,tp,LOCATION_ONFIELD,0,1,nil,74677422)
end
function c123127.sprop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g1=Duel.SelectMatchingCard(tp,c123127.sprfilter,tp,LOCATION_ONFIELD,0,1,1,nil,12394)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g2=Duel.SelectMatchingCard(tp,c123127.sprfilter,tp,LOCATION_ONFIELD,0,1,1,nil,74677422)
	g1:Merge(g2)
	local tc=g1:GetFirst()
	while tc do
		if not tc:IsFaceup() then Duel.ConfirmCards(1-tp,tc) end
		tc=g1:GetNext()
	end
	Duel.SendtoGrave(g1,nil,2,REASON_COST)
end

function c123127.spfilter1(c,code)
	return c:IsFaceup() and c:IsCode(code)
end

function c123127.vfilter(c)
	return c:IsFaceup() and c:IsCode(123101) or c:IsFaceup() and c:IsCode(123102) or c:IsFaceup() and c:IsCode(123103)
end

function c123127.sdcon(e)
	local c=e:GetHandler()
	return Duel.IsExistingMatchingCard(c123127.vfilter,c:GetControler(),LOCATION_SZONE,0,1,c)
end

function c123127.filter(c,e,tp)
	return c:IsCode(74677422) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c123127.spcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():IsReason(REASON_DESTROY) and e:GetHandler():IsPreviousLocation(LOCATION_ONFIELD)
end
function c123127.sptg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c123127.filter(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c123127.filter,tp,LOCATION_GRAVE,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c123127.filter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end
function c123127.spop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
	end
end
function c123127.eqtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(tp) and c123127.tgfilter(chkc) end
	if chk==0 then return e:GetHandler():GetFlagEffect(123127)==0 and Duel.GetLocationCount(tp,LOCATION_SZONE)>0
		and Duel.IsExistingTarget(c123127.tgfilter,tp,LOCATION_MZONE,0,1,e:GetHandler()) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_EQUIP)
	local g=Duel.SelectTarget(tp,c123127.tgfilter,tp,LOCATION_MZONE,0,1,1,e:GetHandler())
	Duel.SetOperationInfo(0,CATEGORY_EQUIP,g,1,0,0)
	e:GetHandler():RegisterFlagEffect(123127,RESET_EVENT+0x7e0000+RESET_PHASE+PHASE_END,0,1)
end
function c123127.eqop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if not c:IsRelateToEffect(e) or c:IsFacedown() then return end
	if not tc:IsRelateToEffect(e) or tc:IsFacedown() then
		Duel.SendtoGrave(c,REASON_EFFECT)
		return
	end
	if not Duel.Equip(tp,c,tc,false) then return end

	--Atk up
	local e6=Effect.CreateEffect(c)
	e6:SetType(EFFECT_TYPE_EQUIP)
	e6:SetCode(EFFECT_UPDATE_ATTACK)
	e6:SetValue(1000)
	e6:SetReset(RESET_EVENT+0x1fe0000)
	c:RegisterEffect(e6)
	--atkup
	local e7=Effect.CreateEffect(c)
	e7:SetType(EFFECT_TYPE_EQUIP)
	e7:SetCode(EFFECT_UPDATE_ATTACK)
	e7:SetValue(c123127.val)
	c:RegisterEffect(e7)
	--eqlimit
	local e8=Effect.CreateEffect(c)
	e8:SetType(EFFECT_TYPE_SINGLE)
	e8:SetCode(EFFECT_EQUIP_LIMIT)
	e8:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
	e8:SetValue(c123127.jeqlimit)
	c:RegisterEffect(e8)
end
function c123127.atkfilter(c)
	return c:IsFaceup() and c:IsRace(RACE_DRAGON)
end
function c123127.val(e,c)
	return Duel.GetMatchingGroupCount(c123127.atkfilter,0,LOCATION_ONFIELD,LOCATION_ONFIELD,nil)*500
end

function c123127.jeqlimit(e,c)
	return c:IsRace(RACE_WARRIOR)
end
function c123127.tgfilter(c)
	return c:IsFaceup() and c:IsRace(RACE_WARRIOR) and c:GetUnionCount()==0
end
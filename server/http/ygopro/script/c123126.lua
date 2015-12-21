--Goddess Bow
function c123126.initial_effect(c)
	c:EnableReviveLimit()
	--spsummon condition
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	e1:SetValue(c123126.splimit)
	c:RegisterEffect(e1)
	--special summon rule
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetRange(LOCATION_EXTRA)
	e2:SetCondition(c123126.sprcon)
	e2:SetOperation(c123126.sprop)
	c:RegisterEffect(e2)
	--equip	
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(123126,0))
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetCategory(CATEGORY_EQUIP)
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetRange(LOCATION_MZONE)
	e3:SetTarget(c123126.eqtg)
	e3:SetOperation(c123126.eqop)
	c:RegisterEffect(e3)
	--self destroy
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetCode(EFFECT_SELF_DESTROY)
	e4:SetCondition(c123126.sdcon)
	c:RegisterEffect(e4)
	--special summon
	local e5=Effect.CreateEffect(c)
	e5:SetDescription(aux.Stringid(123126,2))
	e5:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e5:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e5:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP)
	e5:SetCode(EVENT_TO_GRAVE)
	e5:SetCondition(c123126.spcon)
	e5:SetTarget(c123126.sptg)
	e5:SetOperation(c123126.spop)
	c:RegisterEffect(e5)
	
end
c123126.material_count=2
c123126.material={12394,25652259}
function c123126.splimit(e,se,sp,st)
	return e:GetHandler():GetLocation()~=LOCATION_EXTRA
end
function c123126.sprfilter(c,code)
	return c:IsCode(code) and c:IsAbleToGraveAsCost()
end
function c123126.sprcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.IsExistingMatchingCard(c123126.sprfilter,tp,LOCATION_ONFIELD,0,1,nil,12394)
		and Duel.IsExistingMatchingCard(c123126.sprfilter,tp,LOCATION_ONFIELD,0,1,nil,25652259)
end
function c123126.sprop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g1=Duel.SelectMatchingCard(tp,c123126.sprfilter,tp,LOCATION_ONFIELD,0,1,1,nil,12394)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g2=Duel.SelectMatchingCard(tp,c123126.sprfilter,tp,LOCATION_ONFIELD,0,1,1,nil,25652259)
	g1:Merge(g2)
	local tc=g1:GetFirst()
	while tc do
		if not tc:IsFaceup() then Duel.ConfirmCards(1-tp,tc) end
		tc=g1:GetNext()
	end
	Duel.SendtoGrave(g1,nil,2,REASON_COST)
end

function c123126.spfilter1(c,code)
	return c:IsFaceup() and c:IsCode(code)
end

function c123126.vfilter(c)
	return c:IsFaceup() and c:IsCode(123101) or c:IsFaceup() and c:IsCode(123102) or c:IsFaceup() and c:IsCode(123103)
end

function c123126.sdcon(e)
	local c=e:GetHandler()
	return Duel.IsExistingMatchingCard(c123126.vfilter,c:GetControler(),LOCATION_SZONE,0,1,c)
end

function c123126.filter(c,e,tp)
	return c:IsCode(25652259) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c123126.spcon(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():IsReason(REASON_DESTROY) and e:GetHandler():IsPreviousLocation(LOCATION_ONFIELD)
end
function c123126.sptg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c123126.filter(chkc,e,tp) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c123126.filter,tp,LOCATION_GRAVE,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c123126.filter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end
function c123126.spop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
	end
end
function c123126.eqtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(tp) and c123126.tgfilter(chkc) end
	if chk==0 then return e:GetHandler():GetFlagEffect(123126)==0 and Duel.GetLocationCount(tp,LOCATION_SZONE)>0
		and Duel.IsExistingTarget(c123126.tgfilter,tp,LOCATION_MZONE,0,1,e:GetHandler()) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_EQUIP)
	local g=Duel.SelectTarget(tp,c123126.tgfilter,tp,LOCATION_MZONE,0,1,1,e:GetHandler())
	Duel.SetOperationInfo(0,CATEGORY_EQUIP,g,1,0,0)
	e:GetHandler():RegisterFlagEffect(123126,RESET_EVENT+0x7e0000+RESET_PHASE+PHASE_END,0,1)
end
function c123126.eqop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if not c:IsRelateToEffect(e) or c:IsFacedown() then return end
	if not tc:IsRelateToEffect(e) or tc:IsFacedown() then
		Duel.SendtoGrave(c,REASON_EFFECT)
		return
	end
	if not Duel.Equip(tp,c,tc,false) then return end
	--avoid battle damage	
	local e6=Effect.CreateEffect(c)
	e6:SetType(EFFECT_TYPE_EQUIP)
	e6:SetCode(EFFECT_AVOID_BATTLE_DAMAGE)
	e6:SetValue(1)
	c:RegisterEffect(e6)
	--atkup
	local e7=Effect.CreateEffect(c)
	e7:SetType(EFFECT_TYPE_EQUIP)
	e7:SetCode(EFFECT_UPDATE_ATTACK)
	e7:SetValue(c123126.val)
	c:RegisterEffect(e7)
	--eqlimit
	local e8=Effect.CreateEffect(c)
	e8:SetType(EFFECT_TYPE_SINGLE)
	e8:SetCode(EFFECT_EQUIP_LIMIT)
	e8:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
	e8:SetValue(1)
	c:RegisterEffect(e8)
	--destroy at the end of damage step
	local e9=Effect.CreateEffect(c)
	e9:SetDescription(aux.Stringid(123126,0))
	e9:SetCategory(CATEGORY_DESTROY)
	e9:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e9:SetCode(EVENT_DAMAGE_STEP_END)
	e9:SetRange(LOCATION_SZONE)
	e9:SetCondition(c123126.descon)
	e9:SetTarget(c123126.destg)
	e9:SetOperation(c123126.desop)
	c:RegisterEffect(e9)	
	
end	

function c123126.val(e,c)
		return c:GetAttack()*1
end

function c123126.tgfilter(c)
	return c:IsFaceup() 
end

function c123126.descon(e,tp,eg,ep,ev,re,r,rp)
	local ec=e:GetHandler():GetEquipTarget()
	local dt=nil
	if ec==Duel.GetAttacker() then dt=Duel.GetAttackTarget()
	elseif ec==Duel.GetAttackTarget() then di=Duel.GetAttacker() end
	e:SetLabelObject(dt)
	return dt and dt:IsRelateToBattle()
end
function c123126.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,e:GetLabelObject(),1,0,0)
end
function c123126.desop(e,tp,eg,ep,ev,re,r,rp)
	local dt=e:GetLabelObject()
	if dt:IsRelateToBattle() then
		Duel.Destroy(dt,REASON_EFFECT)
	end
end
